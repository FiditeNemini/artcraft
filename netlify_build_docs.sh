#!/bin/bash
#
set -euxo pipefail

# Install build dependencies
rustup update
rustup default stable

# Emit versions
rustup show

mkdir ./build

cargo run --bin docs-cli

mv api.json ./build


