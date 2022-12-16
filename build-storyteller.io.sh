#!/bin/bash
# NB: This file is executed by Netlify to build storyteller.io

set -euxo pipefail

# Add the GIT SHA to the build
# This must be done before everything else, or it will get cached with the build.
# (This might be making the builds less performant?)
# COMMIT_REF is defined by Netlify to be the commit SHA
# We want a short 8 character reference.
echo "Labelling build with short SHA..."
SHORT_SHA=$(echo "${COMMIT_REF}" | cut -c1-8)
find . -type f -exec sed -i "s/CURRENT_STORYTELLER_VERSION/${SHORT_SHA}/g" {} +
# The above command won't work with Mac's version of find/sed. The following is a Mac-friendly version:
# find . -type f -exec sed -i '' -e "s/CURRENT_STORYTELLER_VERSION/${SHORT_SHA}/g" {} + 

# --ignore-engines: https://stackoverflow.com/a/59615348
yarn build-storyteller --verbose --ignore-optional --ignore-engines

mkdir storyteller
mv packages/storyteller.io/build/ storyteller.io/build/

echo "Copying redirects configuration to Netlify build dir..."
cp _redirects storyteller.io/build/

