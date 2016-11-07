#!/bin/bash
# Upload everything to the server.

declare -r hostname="colossus960.startdedicated.com"

# Sound Library
pushd ~/Dropbox/jungle.horse
rsync -utrv sounds bt@$hostname:/home/bt/dev/trumpet
popd

# Config and Dictionaries
rsync -utrv {dictionary,config.toml} bt@$hostname:/home/bt/dev/trumpet

# Frontend
rsync -utrv web/{images,*css,*html,*txt} bt@$hostname:/home/bt/dev/trumpet/web
pushd frontend
MINIFY=1 webpack
popd
gulp
rsync -utrv web/output bt@$hostname:/home/bt/dev/trumpet/web

# Server
cargo build --release
rsync -utrv target/release/trumpet bt@$hostname:/home/bt/dev/trumpet

