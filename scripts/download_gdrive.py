#!/usr/bin/env python3

import argparse
import gdown
import re

parser = argparse.ArgumentParser(description='Download Google Drive files')

parser.add_argument('--url', type=str, help='the google drive link')
parser.add_argument('--output_filename', type=str, help='the output filename')

# This URL format gets an OAuth screen!! UGH!!
# 'https://drive.google.com/file/d/15-tkgblTZpa0ifmvvyr_kgWy2cguTpAe/view?usp=sharing'
# Fixed URL:
# 'https://drive.google.com/uc?id=15-tkgblTZpa0ifmvvyr_kgWy2cguTpAe'

def normalize_url(url):
    """
    URLs must be in a certain form, or they present the user with an OAuth wall.
    This attempts to fix URLs in the wrong format.
    """
    matches = re.match(r"^https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/", url)
    match_groups = matches.groups()

    if not match_groups or not len(match_groups) == 1:
        return url

    document_token = match_groups[0]
    return 'https://drive.google.com/uc?id={}'.format(document_token)


args = parser.parse_args()

print('URL: {}'.format(args.url))

url = normalize_url(args.url)
print('Normalized URL: {}'.format(url))

gdown.download(url, args.output_filename, quiet=False)

