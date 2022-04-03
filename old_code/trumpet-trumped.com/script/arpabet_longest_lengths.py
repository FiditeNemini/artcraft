#!/usr/bin/env python3
# Print a histogram of the longest polyphones in the database.
# Important for determining whether or not I want to do exponential
# algorithms.

from os import path
import os
import re

DICTIONARY_FILE = '/home/bt/dev/trumpet/dictionary/cmudict-0.7b'

def phoneme_dictionary():
    """
    Read the CMU Word-Phoneme dictionary and extract the phoneme map.
    Returns a map of {word => monophone list}
    """
    lines = []
    with open(DICTIONARY_FILE) as f:
        lines = f.readlines()

    lines = [l for l in lines if re.match("^\w+", l)]
    dictionary = {}

    for l in lines:
        word, *word_phones = l.split()
        dictionary[word] = word_phones

    return dictionary

def print_length_histogram():
    """
    Build and print the histogram of phoneme lengths
    """
    dictionary = phoneme_dictionary()
    histogram = {}
    for word, phoneme in dictionary.items():
        length = len(phoneme)
        if length not in histogram:
            histogram[length] = 0
        histogram[length] += 1

    ordered = sorted(histogram.items(), key=lambda x: x, reverse=True)
    for size, count in ordered:
        line = "{}: {}".format(size, count)
        print(line)


print_length_histogram()

