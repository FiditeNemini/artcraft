import sys
sys.path.append('waveglow/')
import shutil
import json

import numpy as np
import torch

from hparams import create_hparams
from model import Tacotron2
from layers import TacotronSTFT
from audio_processing import griffin_lim
from text import text_to_sequence
from denoiser import Denoiser

from scipy.io.wavfile import write as write_wav

# For metadata
import subprocess
import magic
import os

def print_gpu_info():
    print('========================================')
    print('Python interpreter', sys.executable)
    print('PyTorch version', torch.__version__)
    print('CUDA Available?', torch.cuda.is_available())
    print('CUDA Device count', torch.cuda.device_count())
    print('========================================', flush=True)

def load_tacotron_model(checkpoint_path):
    hparams = create_hparams()
    hparams.sampling_rate = 22050 # Don't change this
    hparams.max_decoder_steps = 1000 # How long the audio will be before it cuts off (1000 is about 11 seconds)
    hparams.gate_threshold = 0.1 # Model must be 90% sure the clip is over before ending generation (the higher this number is, the more likely that the AI will keep generating until it reaches the Max Decoder Steps)
    model = Tacotron2(hparams)
    print('Loading synthesizer at path: {}'.format(checkpoint_path))
    model.load_state_dict(torch.load(checkpoint_path)['state_dict'])
    _ = model.cuda().eval().half()
    # NB(bt, 2021-05-31): Trying to get everything on the same device
    device = "cuda:0"
    model = model.to(device)
    return model

def load_waveglow_model(checkpoint_path):
    waveglow = torch.load(checkpoint_path)['model']
    waveglow.cuda().eval().half()
    for k in waveglow.convinv:
        k.float()
    denoiser = Denoiser(waveglow)
    return waveglow

def preprocess_text(text, raw_input=True):
    # TODO: Handle ARPAbet
    sequence = None
    for i in text.split("\n"):
        if len(i) < 1:
            continue
        print(i)
        if raw_input:
            if i[-1] != ";":
                i = i+";"
        else:
            #i = ARPA(i)
            pass
        print(i)
        with torch.no_grad():
            # save VRAM by not including gradients
            sequence = np.array(text_to_sequence(i, ['english_cleaners']))[None, :]
            sequence = torch.autograd.Variable(torch.from_numpy(sequence)).cuda().long()
            break # TODO: Handle multiple lines.
    return sequence

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

def save_spectorgram_json_file(mel_outputs_postnet, output_spectrogram_filename):
    # squeeze(0) -> 3D to 2D (by removing the singular 1-length "wrapper" dimension)
    # transpose() -> originally 80x{N}, we turn to {N}x80
    mel_for_json = mel_outputs_postnet.cpu().numpy().squeeze(0).transpose()
    mel_for_scaling = mel_for_json.copy()

    max_value = np.amax(mel_for_scaling)
    min_value = np.amin(mel_for_scaling)
    mel_range = max_value - min_value

    mel_for_scaling -= min_value
    mel_for_scaling *= (255.0 / mel_range)
    mel_for_scaling = mel_for_scaling.astype('int32')

    json_data = {
        'mel': mel_for_json,
        'mel_scaled': mel_for_scaling,
    }

    with open(output_spectrogram_filename, 'w') as outfile:
        json.dump(json_data, outfile, cls=NumpyEncoder)

def save_wav_audio_file(audio, output_audio_filename, sampling_rate=22050):
    output_audio = audio[0].data.cpu().numpy().astype(np.float32)
    write_wav(output_audio_filename, sampling_rate, output_audio)

def generate_metadata_file(output_audio_filename, output_metadata_filename):
    # ==== METADATA (1) ====
    command = [
        "ffprobe",
        "-loglevel",  "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        output_audio_filename
    ]

    pipe = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    out, err = pipe.communicate()
    ffmpeg_metadata = json.loads(out)

    print(ffmpeg_metadata)

    # ==== METADATA (2) ====
    mime_type = magic.from_file(output_audio_filename, mime=True)
    file_size_bytes = os.path.getsize(output_audio_filename)

    duration_millis = int(float(ffmpeg_metadata['format']['duration']) * 1000)

    metadata = {
        'duration_millis': duration_millis,
        'mimetype': mime_type,
        'file_size_bytes': file_size_bytes,
    }

    with open(output_metadata_filename, 'w') as json_file:
        json.dump(metadata, json_file)


class TacotronWaveglowPipeline:

    def __init__(self):
        self.tacotron = None
        self.tacotron_filename = None
        self.waveglow = None
        self.waveglow_filename = None

    def maybe_load_waveglow_model(self, checkpoint_path):
        if self.waveglow_filename == checkpoint_path:
            print('Waveglow model already loaded into memory: {}'.format(checkpoint_path))
            return
        print('Dumping previous waveglow model from memory: {}'.format(self.waveglow_filename))
        print('Loading waveglow model into memory: {}'.format(checkpoint_path), flush=True)
        self.waveglow = load_waveglow_model(checkpoint_path)
        self.waveglow_filename = checkpoint_path

    def maybe_load_tacotron_model(self, checkpoint_path):
        if self.tacotron_filename == checkpoint_path:
            print('Tacotron model already loaded into memory: {}'.format(checkpoint_path))
            return
        print('Dumping previous tacotron model from memory: {}'.format(self.tacotron_filename))
        print('Loading tacotron model into memory: {}'.format(checkpoint_path), flush=True)
        self.tacotron = load_tacotron_model(checkpoint_path)
        self.tacotron_filename = checkpoint_path

    def infer(self, args):
        assert('raw_text' in args)
        assert('output_audio_filename' in args)
        assert('output_spectrogram_filename' in args)
        assert('output_metadata_filename' in args)

        sequence = preprocess_text(args['raw_text'])

        with torch.no_grad():
            mel_outputs, mel_outputs_postnet, _, alignments = self.tacotron.inference(sequence)

        with torch.no_grad():
            sigma = 0.8
            audio = self.waveglow.infer(mel_outputs_postnet, sigma=sigma)

        print('Saving spectrogram as JSON...')
        save_spectorgram_json_file(mel_outputs_postnet, args['output_spectrogram_filename'])

        print('Encoding and saving audio...')
        save_wav_audio_file(audio, args['output_audio_filename'])

        print('Generating metadata file...')
        generate_metadata_file(args['output_audio_filename'], args['output_metadata_filename'])
