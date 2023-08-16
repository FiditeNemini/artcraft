#!/bin/bash

set -euxo pipefail

echo 'Running lints...'

# TODO: 'fakeyou_client' is broken
# TODO: 'sqlite_queries' and 'aichatbot-sidecar' are broken due to sqlite

cargo cranky \
  --workspace \
  --exclude sqlite_queries \
  --exclude fakeyou_client \
  --exclude aichatbot-sidecar \

