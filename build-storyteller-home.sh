#!/bin/bash

set -euxo pipefail

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-storyteller-home --verbose --ignore-optional --ignore-engines

mkdir storyteller-home
mv packages/storyteller-home/build/ storyteller-home/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects storyteller-home/build/

