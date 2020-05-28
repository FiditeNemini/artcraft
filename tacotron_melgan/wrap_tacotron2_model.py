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

# Going back in time, this is an old trump txlearned model:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_ljs_arpabet_ckpt30000_2020_02_06'
# Starting again with new samples:
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt7000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt11500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt17000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt27000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt27000-18000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt53500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-14_chkpt112500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-23_chkpt8000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-23_chkpt13000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-24_chkpt2000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-24_chkpt16000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-25_chkpt7000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-25_chkpt17000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-25_chkpt26500'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-25_chkpt40000'
tacotron_model_file = '/home/bt/models/tacotron2-nvidia/tacotron2_trump_txlearn_arpabet_2020-05-25_chkpt50000'


#output_filename = 'tacotron_arpabet_1.pt'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_ckpt30000_2020_02_06.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt7000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt11500.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt17000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt27000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt27000-18000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt53500.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_chkpt112500.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-23_chkpt8000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-23_chkpt13000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-24_chkpt2000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-24_chkpt16000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-25_chkpt7000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-25_chkpt17000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-25_chkpt26500.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-25_chkpt40000.jit'
output_filename = 'tacotron2_trump_txlearn_ljs_arpabet_2020-05-25_chkpt50000.jit'


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
