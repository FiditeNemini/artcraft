#!/bin/bash
# Upload everything to the server.

# Sound Library
pushd ~/Dropbox/jungle.horse
rsync -utrv sounds bt@jungle.horse:/home/bt/dev/trumpet
popd

# Config and Dictionaries
rsync -utrv dictionary bt@jungle.horse:/home/bt/dev/trumpet
rsync -utrv config.toml bt@jungle.horse:/home/bt/dev/trumpet

# Frontend
rsync -utrv web/*css bt@jungle.horse:/home/bt/dev/trumpet/web
rsync -utrv web/*html bt@jungle.horse:/home/bt/dev/trumpet/web
pushd frontend
webpack
popd
gulp
rsync -utrv web/output bt@jungle.horse:/home/bt/dev/trumpet/web/output

# Server
cargo build --release
rsync -utrv target/release/trumpet bt@jungle.horse:/home/bt/dev/trumpet

