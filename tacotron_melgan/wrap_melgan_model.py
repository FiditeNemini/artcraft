#!/usr/bin/env python3
# From: https://github.com/pytorch/pytorch/issues/20356#issuecomment-545572400
import torch
import torch.nn as nn
import torch.nn.functional as F

from collections import OrderedDict
import re
import yaml

#torch.set_default_tensor_type('torch.DoubleTensor')

class ResStack(nn.Module):
    def __init__(self, channel):
        super(ResStack, self).__init__()

        block_list = [
            nn.Sequential(
                nn.LeakyReLU(0.2),
                nn.ReflectionPad1d(3**i),
                nn.utils.weight_norm(nn.Conv1d(channel, channel, kernel_size=3, dilation=3**i)),
                nn.LeakyReLU(0.2),
                nn.utils.weight_norm(nn.Conv1d(channel, channel, kernel_size=1)),
            )
            for i in range(3)
        ]

        self.block0 = block_list[0]
        self.block1 = block_list[1]
        self.block2 = block_list[2]

        shortcut_list = [
            nn.utils.weight_norm(nn.Conv1d(channel, channel, kernel_size=1))
            for i in range(3)
        ]

        self.shortcut0 = shortcut_list[0]
        self.shortcut1 = shortcut_list[1]
        self.shortcut2 = shortcut_list[2]


    def forward(self, x):
        x = self.shortcut0(x) + self.block0(x)
        x = self.shortcut1(x) + self.block1(x)
        x = self.shortcut2(x) + self.block2(x)
        return x

class Container(torch.nn.Module):
    def __init__(self):
        super().__init__()

        mel_channel = 80 # TODO: Load from yaml

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
    def eval(self):
        super(Container, self).eval()


    def forward(self, mel):
        mel = (mel + 5.0) / 5.0 # roughly normalize spectrogram
        audio = self.generator(mel)

        # From inference() method:
        audio = audio.squeeze()
        #MAX_WAV_VALUE = 32768.0
        #audio = MAX_WAV_VALUE * audio

        #return audio.float()
        return audio


print('Loading melgan model...')
melgan_model_file = '/home/bt/models/melgan-swpark/firstgo_a7c2351_3650.pt'
melgan_model = torch.load(melgan_model_file, map_location=torch.device('cpu'))

module = Container()

# NB: This is done so we can rename the model components above since `zip` won't work :(
BLOCK_REGEX = re.compile('blocks\.(\d+)\.')
SHORTCUT_REGEX = re.compile('shortcuts\.(\d+)\.')

new_model_g = [] # Rebuild the ordered dict
for key, value in melgan_model['model_g'].items():
    if 'blocks.' in key:
        new_key = BLOCK_REGEX.sub(r'block\1.', key)
        key = new_key
    elif 'shortcuts.' in key:
        new_key = SHORTCUT_REGEX.sub(r'shortcut\1.', key)
        key = new_key
    new_model_g.append((key, value))


melgan_model['model_g'] = OrderedDict(new_model_g)

print('Load state dict...')
module.load_state_dict(melgan_model['model_g'])

output_filename = 'melgan_container2.pt'

# NB: Tracing evaluates the model on input and unrolls and hardcodes branching
# and loops. Scripting allows these to remain by converting the entire program
# to TorchScript. Scripting seems MUCH faster, is also harder get working.
trace_model = True
if trace_model:
    print('Tracing model and saving as: {}'.format(output_filename))
    mel_file = '/home/bt/dev/voder/data/mels/LJ002-0320.mel'
    mel = torch.load(mel_file, map_location=torch.device('cpu'))
    # NB: Getting `Tracing failed sanity checks! Graphs differed across invocations!`
    traced_script_module = torch.jit.trace(module, mel, check_trace=True)
    traced_script_module.save(output_filename)
else:
    print('Saving script model as: {}'.format(output_filename))
    container = torch.jit.script(module)
    container.save(output_filename)


