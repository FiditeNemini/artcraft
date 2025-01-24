#!/bin/bash

set -euxo pipefail 

echo "Run build script"
npm install
npm build

# echo "Copy test files into dist"
# cp -r test/* dist/
# 
# echo "Copy netlify configs into dist"
# cp _headers dist/
# cp _redirects dist/
# 
# echo "Copy netlify 404.html page into dist"
# cp "404.html" dist/
# 
# echo "List files after build"
# find dist/

