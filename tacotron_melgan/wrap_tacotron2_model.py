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

#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_arpabet_ljs_checkpoint_22000'
#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_arpabet_ljs_checkpoint_54000'
#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_arpabet_ljs_checkpoint_93000'
#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_arpabet_ljs_checkpoint_128000'
#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_arpabet_txlearn_trump_checkpoint_3000'
#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_10000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_9500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_2000'
# AWFUL
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_11500'
# Start new... (bad)
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_1500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_20500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_29500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_41000'
# Great
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_5000'
# Awful
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_13000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_6000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_12000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_1500'
# Distributed run with carefully tweaked validation set
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_4500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_6000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_7000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_15500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_16500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_20500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_1000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_9500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_11000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_16000'
# Really good:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_26000'
# So awful (loss skyrocketed for no reason):
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_32500'
# This one was right before the uptick in loss:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_30000'
# Trying this again with more data
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_13000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_28000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_35500'
# Trying with my voice (very limited data)
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_32500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_3000'
# Another training run
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_500'
# Sounds awesome, but 100% spectral robot noise:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_2000'
# OH GOD, AWFUL. NOT EVEN WORDS:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_7500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_3000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_10000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_76000'
# Modified LJS - pitch +700 reverb +2 +noise
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_4500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_6500'
# Got some spectral noise. Isn't clean. But English is good:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_17500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_78500'
# Training a larger transformed LJS dataset of the same construction:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_9500'
# Post-coronavirus outbreak training
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/checkpoint_17500'

# Going back in time, this is an old trump txlearned model:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_ljs_arpabet_ckpt30000_2020_02_06'


#output_filename = 'tacotron_arpabet_1.pt'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_ckpt30000_2020_02_06.jit'

# NB: Tacotron's original shape is [148, 512]. Arpabet encoding is [256, 512].
NUM_SYMBOLS_ENCODED = 256 # 148 by default, 256 with my custom Arpabet encoding

#torch.set_default_tensor_type('torch.DoubleTensor')
#torch.set_default_tensor_type('torch.FloatTensor')

print('Loading tacotron model...')
#tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_statedict.pt'
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
        return model

# TODO: Maybe not necessary anymore with `map_location=torch.device('cpu')`
#print('Converitng to CPU model...')
#tacotron_model = cuda_to_cpu(tacotron_model)

print('Remove unused keys...')
new_state_dict = [] # Rebuild the ordered dict
for key, value in tacotron_model['state_dict'].items():
    if key.startswith('postnet'):
        continue
    new_state_dict.append((key, value))

tacotron_model['state_dict'] = OrderedDict(new_state_dict)

print('Containerizing model...')
# Save arbitrary values supported by TorchScript
# https://pytorch.org/docs/master/jit.html#supported-type

# Yay duck typing
class HParams:
    mask_padding = True
    fp16_run = False
    n_mel_channels = 80
    n_frames_per_step = 1
    n_symbols = NUM_SYMBOLS_ENCODED
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
#module.eval() # NB: Complains unless called: Did you forget call .eval() on your model?

# NB: Tracing evaluates the model on input and unrolls and hardcodes branching
# and loops. Scripting allows these to remain by converting the entire program
# to TorchScript. Scripting seems MUCH faster, is also harder get working.
trace_model = False
if trace_model:
    print('Tracing model and saving as:'.format(output_filename))
    text_sequence_file = '/home/bt/dev/voder/data/text/tacotron_text_sequence.pt'
    text_sequence = torch.load(text_sequence_file, map_location=torch.device('cpu'))
    # NB: Getting `Tracing failed sanity checks! Graphs differed across invocations!`
    traced_script_module = torch.jit.trace(module, text_sequence, check_trace=False)
    traced_script_module.save(output_filename)
else:
    print('Saving script model as: {}'.format(output_filename))
    container = torch.jit.script(module)
    container.save(output_filename)

print('Done.')
