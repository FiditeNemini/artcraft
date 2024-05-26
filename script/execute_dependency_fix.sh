#!/bin/bash

set -euxo pipefail

echo 'Updating and checking hakari (dependency graph build optimization)'

cargo hakari generate
cargo hakari manage-deps
cargo hakari verify

echo 'Looking for unused dependencies'

# https://github.com/est31/cargo-udeps
# https://stackoverflow.com/a/72082679
cargo  udeps --all-targets

# TODO: Ask for user input before applying some automated heuristics

echo 'Done.'

