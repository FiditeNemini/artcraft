#!/usr/bin/env python3

# For youtube-dl
from __future__ import unicode_literals

import argparse
import gdown
import glob
import os
import re
import urllib
import youtube_dl

parser = argparse.ArgumentParser(description='Download Google Drive files, Youtube videos, or web urls')

parser.add_argument('--url', type=str, help='the web url, google drive link, or youtube url')
parser.add_argument('--output_filename', type=str, help='the output filename')

# This URL format gets an OAuth screen!! UGH!!
# 'https://drive.google.com/file/d/15-tkgblTZpa0ifmvvyr_kgWy2cguTpAe/view?usp=sharing'
# Fixed URL:
# 'https://drive.google.com/uc?id=15-tkgblTZpa0ifmvvyr_kgWy2cguTpAe'

def _normalize_google_drive_url(url):
    """
    URLs must be in a certain form, or they present the user with an OAuth wall.
    This attempts to fix URLs in the wrong format.
    """
    matches = re.match(r"^https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/", url)

    if not matches:
        return url

    match_groups = matches.groups()

    if not match_groups or not len(match_groups) == 1:
        return url

    document_token = match_groups[0]
    return 'https://drive.google.com/uc?id={}'.format(document_token)


def download_url_or_gdrive(url, output_filename):
    url = _normalize_google_drive_url(url)
    print('Normalized URL: {}'.format(url))

    gdown.download(url, output_filename, quiet=False)

def download_youtube(youtube_url, output_filename):

    filename_expected = "ytdl_download/filename"

    ydl_opts = {
        'outtmpl': filename_expected,
        'noplaylist': True,
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    # ytdl forcefully appends the extension
    filename_search = '{}*'.format(filename_expected)

    found_filename = None
    for file in glob.glob(filename_search):
        found_filename = file
        break
    print('Downloaded as: {}'.format(found_filename))

    os.rename(found_filename, output_filename)

args = parser.parse_args()
url = args.url
output_filename = args.output_filename

print('URL: {}'.format(url))
print('Output filename: {}'.format(output_filename))

parsed_url = urllib.parse.urlparse(url)
if 'youtube' in parsed_url.hostname:
    print('Downloading from YouTube...')
    download_youtube(url, output_filename)
else:
    print('Downloading from Gdrive or Web...')
    download_url_or_gdrive(url, output_filename)

