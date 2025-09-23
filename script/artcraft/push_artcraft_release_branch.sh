#!/bin/bash

set -euxo pipefail

git branch -D artcraft-release

git checkout main
git pull

git checkout -b artcraft-release
git push origin artcraft-release

git checkout main

