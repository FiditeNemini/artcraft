#!/bin/bash
# NB: This file is executed by Netlify to build fakeyou.com

set -euxo pipefail

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-fakeyou --verbose --ignore-optional --ignore-engines

mkdir fakeyou
mv packages/fakeyou/build/ fakeyou/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects fakeyou/build/

