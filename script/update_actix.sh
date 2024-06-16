#!/bin/bash

set -euxo pipefail

echo 'Updating actix dependencies'

# TODO: actix-cors update was causing issues
cargo update --verbose \
  actix \
  actix-codec \
  actix-files \
  actix-http \
  actix-macros \
  actix-multipart \
  actix-multipart-derive \
  actix-router \
  actix-rt \
  actix-server \
  actix-web \
  actix-web-actors \
  actix-web-lab

