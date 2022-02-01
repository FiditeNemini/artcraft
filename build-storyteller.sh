#!/bin/bash

set -euxo pipefail

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-storyteller --verbose --ignore-optional --ignore-engines

mkdir storyteller
mv packages/storyteller/build/ storyteller/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects storyteller/build/

