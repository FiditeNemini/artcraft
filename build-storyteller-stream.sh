#!/bin/bash
# NB: This file is executed by Netlify to build stream.storyteller.io (soon storyteller.stream)

set -euxo pipefail

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-storyteller-stream --verbose --ignore-optional --ignore-engines

mkdir storyteller-stream
mv packages/storyteller-stream/build/ storyteller-stream/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects storyteller-stream/build/

