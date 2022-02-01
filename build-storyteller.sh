#!/bin/bash

set -euxo pipefail

## NB: Temporary for migration
#ln -s fakeyou/ fakeyou
#
#pushd fakeyou/
#
#npm install
#npm run-script build
#
#popd
#
#echo "Copying redirects configuration to Netlify build dir..."
#cp _redirects fakeyou/build

yarn build-storyteller

mkdir storyteller
mv packages/storyteller/build/ storyteller/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects storyteller/build/
