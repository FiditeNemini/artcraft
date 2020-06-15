#!/bin/bash

set -euxo pipefail

pushd vocodes/

npm install
npm run-script build

