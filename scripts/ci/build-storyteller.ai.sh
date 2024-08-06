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
  pushd src/website
  yarn install 
  # --ignore-engines: https://stackoverflow.com/a/59615348
  yarn build-fakeyou --verbose --ignore-optional --ignore-engines
  popd
}

function build_zola {
  zola --root zola build 
}

echo "Current working directory:"
pwd

echo "Labelling build with short SHA..."
replace_commit_ref

echo "Building zola blog..."
build_zola

echo "Building website..."
build_website

echo "Create final output directory..."
mkdir -p storyteller.ai/zola
mkdir -p storyteller.ai/website

echo "Copying zola blog artifacts..."
cp -r zola/public/* storyteller.ai/zola/

echo "Copying website artifacts..."
mv src/website/packages/fakeyou.com/build/* storyteller.ai/website/

echo "Copying redirects configuration to Netlify build dir..."
cp src/netlify_configs/storyteller.ai/_redirects storyteller.ai/

echo "List files in build directory"
find storyteller.ai/
