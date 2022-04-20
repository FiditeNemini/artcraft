#!/bin/bash
# NB: This file is executed by Netlify to build obs.storyteller.io (soon obs.storyteller.stream)

set -euxo pipefail

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-storyteller-obs --verbose --ignore-optional --ignore-engines

mkdir storyteller-obs
mv packages/storyteller-obs/build/ storyteller-obs/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects storyteller-obs/build/

