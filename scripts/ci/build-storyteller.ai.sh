#!/bin/bash
# NB: This file is executed by Netlify to build storyteller.io

set -euxo pipefail

function replace_commit_ref {
  # Add the GIT SHA to the build
  # This must be done before everything else, or it will get cached with the build.
  # (This might be making the builds less performant?)
  # COMMIT_REF is defined by Netlify to be the commit SHA
  # We want a short 8 character reference.
  SHORT_SHA=$(echo "${COMMIT_REF}" | cut -c1-8)
  find . -type f -exec sed -i "s/CURRENT_STORYTELLER_VERSION/${SHORT_SHA}/g" {} +
  # The above command won't work with Mac's version of find/sed. The following is a Mac-friendly version:
  # find . -type f -exec sed -i '' -e "s/CURRENT_STORYTELLER_VERSION/${SHORT_SHA}/g" {} + 
}

function build_project {
  yarn install 
  # --ignore-engines: https://stackoverflow.com/a/59615348
  yarn build-storyteller --verbose --ignore-optional --ignore-engines
}

echo "Current working directory:"
pwd

echo "Labelling build with short SHA..."
replace_commit_ref


echo "Building project..."
pushd src/website
build_project
popd

echo "Copying built artifacts..."
mkdir storyteller.io
mv src/websites/packages/storyteller.io/build/ storyteller.io/build/

echo "Copying redirects configuration to Netlify build dir..."
cp src/websites/_redirects storyteller.io/build/

