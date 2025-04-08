#!/usr/bin/env bash

# Tauri doesn't let you configure the frontend project directory statically, though they do provide an
# environment variable to pass it to the CLI. Without doing this, the tauri cli randomly walks the
# filesystem and finds the wrong frontend code.

# TODO(bt,2025-02-13): This is not the correct way to get the root dir
root_dir=$(pwd)
frontend_path="${root_dir}/frontend/editor2d"

pushd "${frontend_path}"
npm install
popd

export TAURI_FRONTEND_PATH="${frontend_path}"
export TAURI_APP_PATH="${root_dir}/crates/desktop/tauri-4o"

cargo tauri dev --no-watch
