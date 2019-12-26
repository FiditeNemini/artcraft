#!/usr/bin/env python3
# From: https://github.com/pytorch/pytorch/issues/20356#issuecomment-545572400
import torch
import torch.nn as nn
import torch.nn.functional as F

from collections import OrderedDict
import yaml

class ResStack(nn.Module):
    def __init__(self, channel):
        super(ResStack, self).__init__()

        self.blocks = nn.ModuleList([
            nn.Sequential(
                nn.LeakyReLU(0.2),
                nn.ReflectionPad1d(3**i),
                nn.utils.weight_norm(nn.Conv1d(channel, channel, kernel_size=3, dilation=3**i)),
                nn.LeakyReLU(0.2),
                nn.utils.weight_norm(nn.Conv1d(channel, channel, kernel_size=1)),
            )
            for i in range(3)
        ])

        self.shortcuts = nn.ModuleList([
            nn.utils.weight_norm(nn.Conv1d(channel, channel, kernel_size=1))
            for i in range(3)
        ])

    def forward(self, x):
        # TODO: THIS WON'T WORK
        #for block, shortcut in zip(self.blocks, self.shortcuts):
        #    x = shortcut(x) + block(x)
        for block in self.blocks:
            x = block(x)
        return x

    # TODO: Looks unnecessary. Remove once this works.
    #def remove_weight_norm(self):
    #    for block, shortcut in zip(self.blocks, self.shortcuts):
    #        nn.utils.remove_weight_norm(block[2])
    #        nn.utils.remove_weight_norm(block[4])
    #        nn.utils.remove_weight_norm(shortcut)

class Container(torch.nn.Module):
    def __init__(self, my_values):
        super().__init__()

        for key in my_values:
            setattr(self, key, my_values[key])

        mel_channel = 80 # TODO: Load from yaml

        # TODO:
        #print("Hprams:")
        #print(self.melgan_hp_str)
        #hparams = yaml.loads(self.melgan_hp_str)
        #print(hparams)
        #hp = load_hparam_str(checkpoint['hp_str'])
        #hp.audio.n_mel_channels

        self.generator = nn.Sequential(
            nn.ReflectionPad1d(3),
            nn.utils.weight_norm(nn.Conv1d(mel_channel, 512, kernel_size=7, stride=1)),

            nn.LeakyReLU(0.2),
            nn.utils.weight_norm(nn.ConvTranspose1d(512, 256, kernel_size=16, stride=8, padding=4)),

            ResStack(256),

            nn.LeakyReLU(0.2),
            nn.utils.weight_norm(nn.ConvTranspose1d(256, 128, kernel_size=16, stride=8, padding=4)),

            ResStack(128),

            nn.LeakyReLU(0.2),
            nn.utils.weight_norm(nn.ConvTranspose1d(128, 64, kernel_size=4, stride=2, padding=1)),

            ResStack(64),

            nn.LeakyReLU(0.2),
            nn.utils.weight_norm(nn.ConvTranspose1d(64, 32, kernel_size=4, stride=2, padding=1)),

            ResStack(32),

            nn.LeakyReLU(0.2),
            nn.ReflectionPad1d(3),
            nn.utils.weight_norm(nn.Conv1d(32, 1, kernel_size=7, stride=1)),
            nn.Tanh(),
        )

    # TODO: Looks unnecessary. Remove once this works.
    def eval(self, inference=False):
        super(Container, self).eval()

        # don't remove weight norm while validation in training loop
        if inference:
            self.remove_weight_norm()

    # TODO: Looks unnecessary. Remove once this works.
    #def remove_weight_norm(self):
    #    for idx, layer in enumerate(self.generator):
    #        if len(layer.state_dict()) != 0:
    #            try:
    #                nn.utils.remove_weight_norm(layer)
    #            except:
    #                layer.remove_weight_norm()

    def forward(self, mel):
        mel = (mel + 5.0) / 5.0 # roughly normalize spectrogram
        return self.generator(mel)


print('Loading melgan model...')
#melgan_model_file = '/home/bt/models/melgan-swpark/firstgo_a7c2351_1100.pt'
melgan_model_file = '/home/bt/models/firstgo_a7c2351_1100.pt'
melgan_model = torch.load(melgan_model_file, map_location=torch.device('cpu'))

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

print('Converitng to CPU model...')
cuda_to_cpu(melgan_model)


print('Containerizing model...')
# Save arbitrary values supported by TorchScript
# https://pytorch.org/docs/master/jit.html#supported-type
graph = {
    # NB: You can't save a toplevel dictionary of dictionaries,
    # like so: 'melgan': melgan_model,
    # Per inference.py, it looks like only model_g is used.
    'melgan_model_g': melgan_model['model_g'], # NB: keeping this out to load below.
    #'melgan_model_d': melgan_model['model_d'],
    #'melgan_optim_g': melgan_model['optim_g'],
    #'melgan_optim_d': melgan_model['optim_d'],
    'melgan_step': melgan_model['step'],
    'melgan_epoch': melgan_model['epoch'],
    'melgan_hp_str': melgan_model['hp_str'],
    'melgan_githash': melgan_model['githash'],
}

module = Container(graph)

print('Load state dict...')
module.load_state_dict(melgan_model['model_g'])
module.eval(inference=False)

print('JIT model...')
container = torch.jit.script(module)

print('Saving model...')
container.save("container.pt")

