#!/bin/bash
#
set -euxo pipefail

# Install build dependencies
rustup update
rustup default stable

# Emit versions
rustup show

mkdir -p ./build

cargo run --bin docs-cli

mv api.json ./build
cp api_docs.html ./build/index.html


