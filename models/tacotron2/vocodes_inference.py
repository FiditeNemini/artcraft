#!/usr/bin/env python

"""
Vocodes Tacotron Inference Engine
This is a work in progress and is likely going to be slow for now.
"""

import argparse

parser = argparse.ArgumentParser(description='Run TTS inference')

parser.add_argument('--synthesizer_checkpoint_path', type=str, help='path the TTS synthesizer model', required=True)
parser.add_argument('--vocoder_checkpoint_path', type=str, help='path the TTS vocoder model', required=True)
parser.add_argument('--input_text_filename', type=str, help='path the file containing text to run', required=True)
parser.add_argument('--output_audio_filename', type=str, help='where to save result audio', required=True)
parser.add_argument('--output_spectrogram_filename', type=str, help='where to save result spectrogram', required=True)
parser.add_argument('--output_metadata_filename', type=str, help='where to save extra metadata', required=True)

args = parser.parse_args()

import sys
sys.path.append('waveglow/')
import numpy as np
import torch
import json

from hparams import create_hparams
from train import load_model
from text import text_to_sequence

print('========================================')
print('Python interpreter', sys.executable)
print('PyTorch version', torch.__version__)
print('CUDA Available?', torch.cuda.is_available())
print('CUDA Device count', torch.cuda.device_count())
print('========================================', flush=True)

# NB(bt, 2021-05-31): Trying to get everything on the same device
torch.device("cuda" if torch.cuda.is_available() else "cpu")

hparams = create_hparams()
hparams.sampling_rate = 22050

# Fix bug running on CPU?
#torch.set_default_dtype(torch.float16)
# NB(bt, 2021-05-31): Perhaps this is blocking waveglow? It complains of the wrong tensor type.
#torch.set_default_tensor_type('torch.DoubleTensor') # 2021-05-31 commented out
torch.set_default_tensor_type('torch.HalfTensor') # 2021-05-31 added

# Load synthesizer
checkpoint_path = args.synthesizer_checkpoint_path

model = load_model(hparams)
model.load_state_dict(torch.load(checkpoint_path)['state_dict'])

# NB(bt, 2021-05-31): Trying to get everything on the same device
device = "cuda:0"
model = model.to(device)

_ = model.cuda().eval()

# Load vocoder
waveglow_path = args.vocoder_checkpoint_path

waveglow = torch.load(waveglow_path)['model']
waveglow.cuda().eval().half()
#for k in waveglow.convinv:
#    k.float()
#denoiser = Denoiser(waveglow)

text = open(args.input_text_filename, 'r').read()
seq = text_to_sequence(text, ['english_cleaners'])

sequence = np.array(seq)[None, :]

print("Sequence np.array: {}".format(type(sequence)))
print("Sequence np.array: {}".format(sequence))

sequence = torch.from_numpy(sequence)

print("Sequence from_numpy: {}".format(type(sequence)))
print("Sequence from_numpy: {}".format(sequence))
print("Sequence from_numpy dtype: {}".format(sequence.dtype))

sequence = torch.autograd.Variable(sequence).long()

print("Sequence torch autograd: {}".format(sequence))

# NB(bt, 2021-05-31): Trying to get everything to the same device
sequence = sequence.to(device)

mel_outputs, mel_outputs_postnet, _, alignments = model.inference(sequence)

print("Mel outputs:")
print(mel_outputs)
print(mel_outputs.shape)
print(mel_outputs_postnet)
print(mel_outputs_postnet.shape)

print('Saving mels')

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

#json_dump = json.dumps({'mel': mel_outputs, 'mel_postnet': mel_outputs_postnet}, cls=NumpyEncoder)
#with open(args.output_spectrogram_filename, 'w') as outfile:
#    json.dump(data, outfile)

#torch.save(mel_outputs, 'mel_outputs.mel')
#torch.save(mel_outputs_postnet, 'mel_outputs_postnet.mel')

#print('Rendering histograms')
#render_histogram(mel_outputs, 'mel_outputs.png')
#render_histogram(mel_outputs_postnet, 'mel_outputs_postnet.png')

with torch.no_grad():
    audio = waveglow.infer(mel_outputs_postnet, sigma=0.666)
    pass

#ipd.Audio(audio[0].data.cpu().numpy(), rate=hparams.sampling_rate)

# https://pytorch.org/hub/nvidia_deeplearningexamples_waveglow/
audio_numpy = audio[0].data.cpu().numpy()
rate = 22050
from scipy.io.wavfile import write
write(args.output_audio_filename, rate, audio_numpy)

