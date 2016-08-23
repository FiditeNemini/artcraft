#!/usr/bin/env python2
# Show how many phonemes remain

from os import path
import os
import re

DICTIONARY_FILE = '/home/bt/dev/trumpet/dictionary/cmudict-0.7b'
PHONE_DIR = '/home/bt/Dropbox/jungle.horse/sounds/trump/_phonemes'

def current_phonemes():
    """
    Gets the current set of phoneme wav files.
    Returns a frozenset of strings.
    """
    phonemes = []
    for p in os.listdir(PHONE_DIR):
        if not p.endswith('.wav'):
            continue
        phoneme = p.replace('.wav', '')
        phonemes.append(phoneme)

    return frozenset(phonemes)

def all_phonemes():
    """
    Read the CMU Word-Phoneme dictionary and extract the phoneme set.
    Returns a frozenset of strings.
    """
    lines = []
    with open(DICTIONARY_FILE) as f:
        lines = f.readlines()

    lines = [l for l in lines if re.match("^\w+", l)]
    phonemes = set()

    for l in lines:
        word_phones = l.split()[1:]
        for phoneme in word_phones:
            phonemes.add(phoneme)

    return frozenset(phonemes)

current = current_phonemes()
phonemes = all_phonemes()

print "\nAll Phonemes: {}\n".format(len(phonemes))
li = list(phonemes)
li.sort()
print li

print "\nCurrent Phonemes: {}\n".format(len(current))
li = list(current)
li.sort()
print li

missing = phonemes - current

print "\nMissing Phonemes: {}\n".format(len(missing))
li = list(missing)
li.sort()
print li

