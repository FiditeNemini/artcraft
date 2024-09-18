#!/bin/bash

set -euxo pipefail 

echo "Run build script (TODO: Make strict)"
yarn run build2

echo "List files after build"
find dist/
