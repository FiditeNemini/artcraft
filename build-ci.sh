#!/bin/bash
# NB: This file is executed by Netlify to build the website

# Verbose printing, exit on failure.
set -euxo pipefail

# Add the GIT SHA to the build
# This must be done before everything else, or it will get cached with the build.
# (This might be making the builds less performant?)
# COMMIT_REF is defined by Netlify to be the commit SHA
# We want a short 8 character reference.
echo "Labelling build with short SHA..."
SHORT_SHA=$(echo "${COMMIT_REF}" | cut -c1-8)

find . -type f -exec sed -i "s/CURRENT_STORYTELLER_GIT_VERSION/${SHORT_SHA}/g" {} +

# TODO: Run tests when we add them.

# Run build.
npm run build

