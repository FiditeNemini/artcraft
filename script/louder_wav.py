#!/usr/bin/env python3
# Copyright 2016 Brandon Thomas <bt@brand.io>
# Increase the volume of wav files.

import numpy
import struct
import sys
import wave

SHRT_MIN = -32768
SHRT_MAX = 32767

# TODO: investigate `PyAudio`.

# numpy.fromstring(frames, numpy.int16) #/ 5 * 100
# new_frames = struct.pack('h'*len(frames), *frames)

def read_wav(filename):
    """Read a wav file, return a tuple of (wav_params, frames)."""
    params = None
    frames = None
    with wave.open(filename, 'rb') as w:
        params = w.getparams()
        numframes = params[3]
        frames = w.readframes(numframes)
    return (params, frames)

def generate_noise():
    pass

def get_pcm_channels(wav_params, frames):
    """
    Decompose a wave bytestring (with its associated metadata) into its
    constituent PCM data streams.

    Returns a list of integer data streams (a stream per channel) as a
    list of list of ints.

    From http://stackoverflow.com/a/2227174
    """
    sample_width = wav_params[1]
    if sample_width not in [1, 2]:
        raise ValueError("Only supports 8 and 16 bit audio.")

    num_channels = wav_params[0]
    num_frames = wav_params[3]

    total_samples = num_frames * num_channels

    if sample_width == 1:
        # read unsigned chars
        fmt = '{}B'.format(total_samples)
    else:
        # read signed 2 byte shorts
        fmt = '{}h'.format(total_samples)

    integer_data = struct.unpack(fmt, frames)
    channels = [[] for i in range(num_channels)]

    for i, value in enumerate(integer_data):
        bucket = i % num_channels
        channels[bucket].append(value)

    return channels

def channels_to_bytestream(wav_params, pcm_data):
    num_channels = wav_params[0]
    num_frames = wav_params[3]

    assert(num_channels == len(pcm_data))
    assert(num_frames == len(pcm_data[0]))

    integer_data = []

    for j in range(num_frames):
        integer = 0
        for i in range(num_channels):
            integer = pcm_data[i][j]

            # Change volume by changing the signal amplitude!
            integer *= 10

            # Don't overflow.
            short = saturate_signed_short(integer)

            integer_data.append(short)

    print("Length of pcm_data: {}".format(len(pcm_data)))
    print("Length of a pcm channel: {}".format(len(pcm_data[0])))
    print("Length of packed integer data: {}".format(len(integer_data)))

    return struct.pack('{}h'.format(num_frames*2), *integer_data)


def saturate_signed_short(integer):
    """Don't overflow the signed short width."""
    if integer > SHRT_MAX:
        return SHRT_MAX
    elif integer < SHRT_MIN:
        return SHRT_MIN
    return integer

def write_wav(output_filename, wav_params, frames):
    with wave.open(output_filename, 'wb') as w:
        w.setparams(wav_params)
        w.writeframes(frames)

def main():
    if len(sys.argv) < 3:
        print("Call as ${} INPUT_FILE OUTPUT_FILE".format(sys.argv[0]))
    infile = sys.argv[1]
    outfile = sys.argv[2]

    params, frames = read_wav(infile)
    print(params)

    channels = get_pcm_channels(params, frames)

    bytestring = channels_to_bytestream(params, channels)

    print("Length of original bytestring: {}".format(len(frames)))
    print("Length of new bytestring: {}".format(len(bytestring)))

    write_wav(outfile, params, bytestring)

if __name__ == '__main__':
    main()
