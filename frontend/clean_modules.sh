#!/bin/bash

set -euxo pipefail

echo "Removing Node Modules..."
rm -rf ./node_modules/
rm -rf ./apps/editor2d/node_modules/
rm -rf ./apps/editor3d/node_modules/

