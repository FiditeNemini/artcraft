#!/bin/bash
# Upload everything to the server.

pushd ~/Dropbox/jungle.horse
rsync -utrv sounds bt@jungle.horse:/home/bt/dev/trumpet
popd

rsync -utrv dictionary bt@jungle.horse:/home/bt/dev/trumpet

