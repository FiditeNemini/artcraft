#!/usr/bin/env python3
# Adapted From: https://github.com/pytorch/pytorch/issues/20356#issuecomment-545572400
import torch
import torch.nn as nn
import torch.nn.functional as F

from collections import OrderedDict
import re
import yaml
from math import sqrt

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
#graph = {
#    # NB: You can't save a toplevel dictionary of dictionaries,
#    # like so: 'melgan': melgan_model,
#    # Per inference.py, it looks like only model_g is used.
#    'melgan_model_g': melgan_model['model_g'], # NB: keeping this out to load below.
#    #'melgan_model_d': melgan_model['model_d'],
#    #'melgan_optim_g': melgan_model['optim_g'],
#    #'melgan_optim_d': melgan_model['optim_d'],
#    'melgan_step': melgan_model['step'],
#    'melgan_epoch': melgan_model['epoch'],
#    'melgan_hp_str': melgan_model['hp_str'],
#    'melgan_githash': melgan_model['githash'],
#}

module = Tacotron2()

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

