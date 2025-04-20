#!/usr/bin/env bash

set -euxo pipefail

# Tauri doesn't let you configure the frontend project directory statically, though they do provide an
# environment variable to pass it to the CLI. Without doing this, the tauri cli randomly walks the
# filesystem and finds the wrong frontend code.

# TODO(bt,2025-02-13): This is not the correct way to get the root dir
root_dir=$(pwd)
frontend_path="${root_dir}/frontend"

pushd "${frontend_path}"
#nvm use stable
npm install
popd

export TAURI_FRONTEND_PATH="${frontend_path}"
export TAURI_APP_PATH="${root_dir}/crates/desktop/tauri-artcraft"

export CONFIG_PATH="${TAURI_APP_PATH}/tauri.artcraft_2d.conf.json"

#cargo tauri dev --no-watch -- --config "${CONFIG_PATH}"
cargo tauri dev -- -- --no-watch --config "${CONFIG_PATH}"
