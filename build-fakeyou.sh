#!/bin/bash
# NB: This file is executed by Netlify to build fakeyou.com

set -euxo pipefail

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-fakeyou --verbose --ignore-optional --ignore-engines

mkdir fakeyou
mv packages/fakeyou/build/ fakeyou/build/

# Add the GIT SHA to the build
# COMMIT_REF is defined by Netlify to be the commit SHA
# We want a short 8 character reference.
SHORT_SHA=$(echo "${COMMIT_REF}" | cut -c1-8)
find . -type f -exec sed -i '' -e "s/CURRENT_STORYTELLER_VERSION/${SHORT_SHA}/g" {} +

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects fakeyou/build/

