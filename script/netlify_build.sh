#!/bin/bash

set -euxo pipefail 

echo "Run build script (TODO: Make strict)"
yarn run build2

echo "Copy test files into dist"
cp -r test/* dist/

echo "List files after build"
find dist/
