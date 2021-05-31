#!/bin/bash

set -euxo pipefail

pushd vocodes/

npm install
npm run-script build

popd

echo "Copying redirects configuration to build dir..."
cp _redirects /vocodes/build

