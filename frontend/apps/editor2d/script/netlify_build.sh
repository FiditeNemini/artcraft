#!/bin/bash

set -euxo pipefail 

echo "Run build script (TODO: Make strict)"
nx build editor2d

echo "Make dist dir"
mkdir dist/

#echo "Copy test files into dist"
#cp -r test/* dist/

echo "Copy netlify configs into dist"
cp apps/editor2d/_headers dist/
cp apps/editor2d/_redirects dist/

echo "Copy netlify 404.html page into dist"
cp apps/editor2d/404.html dist/

echo "List files after build"
find dist/

echo "List other files(1)"
ls -lA /

echo "List other files(2)"
pwd
ls -lA .

echo "Find"
pwd
find . | grep build

