#!/usr/bin/env python3
# From: https://github.com/pytorch/pytorch/issues/20356#issuecomment-545572400
import torch

from collections import OrderedDict

class Container(torch.nn.Module):
    def __init__(self, my_values):
        super().__init__()
        for key in my_values:
            setattr(self, key, my_values[key])

    def forward(self, x):
        # NB(bt): This wasn't originally provided. I'm assuming this is a torch thing
        #y = [self.layer1(x[0]), self.layer2(x[1])]
        #return y
        return x

# my_values = {
#    'a': torch.ones(2, 2),
#    'b': torch.ones(2, 2) + 10,
#    'c': 'hello',
#    'd': 6
#}

print('Loading melgan model...')
melgan_model_file = '/home/bt/models/melgan-swpark/firstgo_a7c2351_1100.pt'
melgan_model = torch.load(melgan_model_file)

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

"""
for model_key, model_payload in melgan_model.items():
    print("===== Model Key: {} =====".format(model_key))
    if isinstance(model_payload, dict) or isinstance(model_payload, OrderedDict):
        for k, v in model_payload.items():
            #print("Key: {}".format(k))
            #print("Type v: {}".format(type(v)))
            if isinstance(v, torch.Tensor):
                v = v.cpu()
            #print(v)

for model_key, model_payload in melgan_model.items():
    print("===== Model Key: {} =====".format(model_key))
    if isinstance(model_payload, dict) or isinstance(model_payload, OrderedDict):
        for k, v in model_payload.items():
            pass
            #print("Key: {}".format(k))
            #print("Type v: {}".format(type(v)))
            #print(v)
"""

print('Containerizing model...')
# Save arbitrary values supported by TorchScript
# https://pytorch.org/docs/master/jit.html#supported-type
graph = {
    # NB: You can't save a toplevel dictionary of dictionaries,
    # like so: 'melgan': melgan_model,
    'melgan_model_g': melgan_model['model_g'],
    'melgan_model_d': melgan_model['model_d'],
    'melgan_optim_g': melgan_model['optim_g'],
    'melgan_optim_d': melgan_model['optim_d'],
    'melgan_step': melgan_model['step'],
    'melgan_epoch': melgan_model['epoch'],
    'melgan_hp_str': melgan_model['hp_str'],
    'melgan_githash': melgan_model['githash'],
}

container = torch.jit.script(Container(graph))

print('Saving model...')
container.save("container.pt")

