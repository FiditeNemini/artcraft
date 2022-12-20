#!/usr/bin/bash

declare -r CHROME_DIR="${HOME}/.chromeDevTemp"

# NB: Creating the directory first seems to block process start.
# Perhaps this is the wrong chmod ownership flags.
#mkdir -p $CHROME_DIR

chromium \
  --disable-web-security \
  --ignore-certificate-errors \
  --user-data-dir="${CHROME_DIR}" \
  https://dev.fakeyou.com

