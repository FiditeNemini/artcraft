#!/usr/bin/env python3
# parts taken from: https://github.com/pytorch/pytorch/issues/20356#issuecomment-545572400
"""
SUPER STUPID HACK

libtensor/tch.rs do not seem to be able to load tensors saved from
mytorch with `foo_tensor.save()`. This gets around the problem by
wrapping tensors in JIT containers that can be loaded. The source
tensor can be pulled out by calling `forward` on the module.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

import sys
from collections import OrderedDict

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
        return model

class Container(torch.nn.Module):
    def __init__(self, payload):
        super(Container, self).__init__()
        self.tensor = payload
    def forward(self, x):
        return self.tensor # XXX: This is how we return the wrapped tensor. Such a hack.

def main(filename):
    output_filename = '{}.containerized.pt'.format(filename)

    print('Loading tensor file: {}'.format(filename))
    tensor = torch.load(filename, map_location=torch.device('cpu'))

    if not isinstance(tensor, torch.Tensor):
        type_ = type(tensor)
        raise Exception('File should contain object of type Tensor, not {}'.format(type_))

    print('Switching device from CUDA to CPU (if necessary)')
    cpu_tensor = cuda_to_cpu(tensor)

    print('Containerizing. Libtorch can\'t read raw tensors from ' \
        + 'pytorch (at least I don\'t know how)')

    container = Container(cpu_tensor)
    jit_container = torch.jit.script(container)

    print('Saving: {}'.format(output_filename))
    jit_container.save(output_filename)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Must supply input filename')
        sys.exit(1)

    filename = sys.argv[1]
    main(filename)

