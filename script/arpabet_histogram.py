#!/usr/bin/env python3
# Print a histogram of top monophones, diphones, and triphones.

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

def get_n_phones(phoneme_list, n):
    """
    Return a list of n-phones within a phoneme list.
    Returns a list of lists of strings or an empty list.
    """
    if n < 1 or n > len(phoneme_list):
        return []
    elif n == len(phoneme_list):
        return [phoneme_list[:]]
    else:
        span = len(phoneme_list) - n
        n_phones = []
        for i in range(span):
            n_phone = [phoneme_list[j] for j in range(i, i+n)]
            n_phones.append(n_phone)
        return n_phones

def print_histogram(n):
    """
    Build and print the histogram for the given size
    """
    dictionary = phoneme_dictionary()
    n_phone_map = {}
    for word, phoneme in dictionary.items():
        n_phones = get_n_phones(phoneme, n)
        for n_phone in n_phones:
            key = str(n_phone)
            if key not in n_phone_map:
                n_phone_map[key] = []
            n_phone_map[key].append(word)

    ordered = sorted(n_phone_map.items(), key=lambda x: len(x[1]), reverse=True)

    print("MOST FREQUENT {}-PHONES:\n".format(n))

    for it in ordered[0:100]:
        line = "{}, {} - eg.{}".format(it[0], len(it[1]), it[1][0])
        print(line)

print_histogram(3)

