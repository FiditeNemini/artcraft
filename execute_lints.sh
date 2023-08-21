#!/bin/bash

set -euxo pipefail

echo 'Running lints...'

# TODO: 'fakeyou_client' is broken
# TODO: 'sqlite_queries' and 'aichatbot-sidecar' are broken due to sqlite
# newrelic excluded since we don't author it

cargo cranky \
  --workspace \
  --exclude aichatbot-sidecar \
  --exclude fakeyou_client \
  --exclude sqlite_queries \
  --exclude newrelic-telemetry

echo 'Lints passed.'
