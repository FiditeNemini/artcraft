#!/bin/bash

set -euxo pipefail

echo 'Running lints...'

# TODO: 'sqlite_queries' and 'aichatbot-sidecar' are broken due to sqlite

cargo clippy \
  --workspace \
  --exclude sqlite_queries \
  --exclude aichatbot-sidecar \

