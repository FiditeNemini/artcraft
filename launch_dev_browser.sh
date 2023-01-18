#!/bin/bash

declare -r CHROME_DIR="${HOME}/.chromeDevTemp"

# NB: Creating the directory first seems to block process start.
# Perhaps this is the wrong chmod ownership flags.
#mkdir -p $CHROME_DIR

launch_linux() {
  chromium \
    --disable-web-security \
    --ignore-certificate-errors \
    --user-data-dir="${CHROME_DIR}" \
    https://dev.fakeyou.com
}

launch_mac() {
  open -na "Google Chrome" --args \
    --disable-site-isolation-trials \
    --disable-web-security \
    --ignore-certificate-errors \
    --user-data-dir="${CHROME_DIR}" \
    https://dev.fakeyou.com
}

case $OSTYPE in 
  linux*)
    launch_linux
  ;; 
  darwin*)
    launch_mac
  ;; 
  *)
    echo "Unknown OS"
  ;; 
esac

