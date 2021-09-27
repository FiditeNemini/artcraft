#!/bin/bash

set -euxo pipefail

# NB: Temporary for migration
ln -s vocodes/ fakeyou

pushd vocodes/

npm install
npm run-script build

popd

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects vocodes/build

