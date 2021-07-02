
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

def print_info():
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

class TacotronWaveglowPipeline:

    def __init__(self, tacotron: Tacotron2, waveglow: Denoiser):
        self.tacotron = tacotron
        self.waveglow = waveglow

    def infer(self, raw_text):
        sequence = preprocess_text(raw_text)

        with torch.no_grad():
            mel_outputs, mel_outputs_postnet, _, alignments = self.tacotron.inference(sequence)

        with torch.no_grad():
            sigma = 0.8
            audio = self.waveglow.infer(mel_outputs_postnet, sigma=sigma)


        output_audio = audio[0].data.cpu().numpy().astype(np.float32)

        print(output_audio)

        #write_wav(args.output_audio_filename, hparams.sampling_rate, output_audio)

