#!/bin/bash
# Upload everything to the server.

pushd ~/Dropbox/jungle.horse
rsync -utrv sounds bt@jungle.horse:/home/bt/dev/trumpet
popd

rsync -utrv dictionary bt@jungle.horse:/home/bt/dev/trumpet
rsync -utrv config.toml bt@jungle.horse:/home/bt/dev/trumpet

cargo build --release
rsync -utrv target/release/trumpet  bt@jungle.horse:/home/bt/dev/trumpet

