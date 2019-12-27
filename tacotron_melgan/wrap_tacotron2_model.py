#!/usr/bin/env python3
# Adapted From: https://github.com/pytorch/pytorch/issues/20356#issuecomment-545572400
import torch
import torch.nn as nn
import torch.nn.functional as F

from collections import OrderedDict
import re
import yaml
from math import sqrt

from tacotron_model import Tacotron2

print('Loading tacotron model...')
#melgan_model_file = '/home/bt/models/melgan-swpark/firstgo_a7c2351_3650.pt'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_statedict.pt'
tacotron_model = torch.load(tacotron_model_file, map_location=torch.device('cpu'))

def cuda_to_cpu(model):
    """Recursively make everything non-CUDA"""
    if isinstance(model, dict) or isinstance(model, OrderedDict):
        for key, value in model.items():
            model[key] = cuda_to_cpu(value)
        return model
    if isinstance(model, list):
        for i, value in enumerate(model):
            model[i] = cuda_to_cpu(value)
    elif isinstance(model, torch.Tensor):
        return model.cpu()
    else:
        #print(type(model))
        return model

# TODO: Maybe not necessary anymore with `map_location=torch.device('cpu')`
print('Converitng to CPU model...')
tacotron_model = cuda_to_cpu(tacotron_model)

print(type(tacotron_model))
print(tacotron_model.keys())

print('Containerizing model...')
# Save arbitrary values supported by TorchScript
# https://pytorch.org/docs/master/jit.html#supported-type

class HParams:
    mask_padding = True
    fp16_run = False
    n_mel_channels = 80
    n_frames_per_step = 1
    n_symbols = 148 # NB: Determined by running inference
    symbols_embedding_dim = 512
    encoder_kernel_size = 5
    encoder_n_convolutions = 3
    encoder_embedding_dim = 512
    attention_rnn_dim = 1024
    decoder_rnn_dim = 1024
    prenet_dim = 256
    max_decoder_steps = 1000
    gate_threshold = 0.5
    p_attention_dropout = 0.1
    p_decoder_dropout = 0.1
    attention_dim = 128
    attention_location_n_filters = 32
    attention_location_kernel_size = 31

module = Tacotron2(HParams())

print('Load state dict...')
module.load_state_dict(tacotron_model['state_dict'])
#module.eval(inference=False)

print('JIT model...')
mel_file = '/home/bt/dev/voder/data/mels/LJ002-0320.mel'
example = torch.load(mel_file, map_location=torch.device('cpu'))
traced_script_module = torch.jit.trace(module, example)
traced_script_module.save("container2.pt")

#print('Saving model...')
#container = torch.jit.script(module)
#container.save("container.pt")

