#!/usr/bin/env bash

set -euxo pipefail

root_dir=$(pwd)
frontend_path="${root_dir}/frontend"
rust_crate_path="${root_dir}/crates/desktop/tauri-artcraft"
config_path="${rust_crate_path}/tauri.artcraft_3d.conf.toml"

export TAURI_FRONTEND_PATH="${frontend_path}"
export TAURI_APP_PATH="${rust_crate_path}"

# rm -f ./target/debug/tauri-artcraft
# 
# rm -f ./target/debug/artcraft.d
# rm -f ./target/debug/libapp_lib.a
# rm -f ./target/debug/libapp_lib.d
# rm -f ./target/debug/libapp_lib.dylib
# rm -f ./target/debug/libapp_lib.rlib
# rm -f ./target/debug/libtauri_artcraft_app_lib.a
# rm -f ./target/debug/libtauri_artcraft_app_lib.d
# rm -f ./target/debug/libtauri_artcraft_app_lib.dylib
# rm -f ./target/debug/libtauri_artcraft_app_lib.rlib
# rm -f ./target/debug/tauri-artcraft.d
# 
# rm -rf ./target/debug/incremental/tauri_artcraft*
# rm -rf ./target/debug/incremental/artcraft*
# rm -rf ./target/debug/incremental/app_lib*

# Tauri CLI is being bad-behaved, so just run via cargo.
# NX will need to launch the frontend separately.
#cargo build --bin tauri-artcraft --config "${config_path}"
#cargo tauri build --debug --config "${config_path}"

#./target/debug/tauri-artcraft

# DOES NOT WORK AS ADVERTISED:
#export TAURI_CLI_NO_DEV_SERVER_WAIT=true
#export TAURI_CLI_PORT=12222

# DOES NOT WORK AS ADVERTISED:
cargo tauri dev --no-dev-server \
  --no-dev-server-wait \
  --no-watch \
  --runner cargo \
  --port 12223 \
  --config "${config_path}"


#Patch Options: `Options { 
#runner: Some("cargo"), 
#target: None, 
#features: None, 
#exit_on_panic: false, 
#config: [ConfigValue(Object {"build": Object {"frontendDist": String("../../../frontend/apps/editor3d/dist"), "beforeDevCommand": String("nx run editor3d:dev"), "devUrl": String("http:
#//localhost:5173")}})], 
#release_mode: false, 
#args: [], 
#no_dev_server_wait: true, 
#no_watch: false, 
#no_dev_server: false, 
#port: Some(12223), 
#host: None }`

#cargo tauri build \
#  --debug \
#  --no-bundle \
#  --config "${config_path}"

