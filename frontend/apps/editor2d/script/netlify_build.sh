#!/bin/bash

set -euxo pipefail 

echo "Run build script (TODO: Make strict)"
nx build editor2d

echo "Change to project dir"
pushd apps/editor2d/

echo "List directory files"
pwd
ls -lA .

echo "Copy netlify configs into dist"
cp _headers dist/
cp _redirects dist/

echo "Copy netlify 404.html page into dist"
cp "404.html" dist/

echo "List files after build"
find dist/

