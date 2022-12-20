#!/usr/bin/bash

declare -r CHROME_DIR="${HOME}/.chromeDevTemp"

mkdir -p $CHROME_DIR

chromium \ 
  --disable-web-security \
  --ignore-certificate-errors \
  --user-data-dir $CHROME_DIR

