#!/bin/bash

set -euxo pipefail

echo 'Running tests...'

# TODO: Fix 'fakeyou_client' and 'billing_component'
# TODO: Run 'sqlite_queries' and 'aichatbot-sidecar' after postgres migrations

cargo test \
  --workspace \
  --exclude sqlite_queries \
  --exclude aichatbot-sidecar \
  --exclude fakeyou_client \
  --exclude billing_component

