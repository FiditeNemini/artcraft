#!/bin/bash

set -euxo pipefail

echo 'Looking for unused dependencies'

# https://github.com/est31/cargo-udeps
# https://stackoverflow.com/a/72082679
# Needs nightly to run
cargo +nightly udeps --all-targets

# TODO: Ask for user input before applying some automated heuristics

echo 'Done.'
