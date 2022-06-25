#!/bin/bash

# This is complicated since we're now in a more complex Rust workspace with 
# multiple projects and targets.

# NB(2022-01-31): For some reason, 'storyteller-web', despite importing the obs queries 
# via the `database_queries` shared library, started to exclude these queries. It was 
# working, but mysteriously stopped. I'm using this more complicated setup with jq-based 
# json merge as a stop gap.

# NB: This format can be used without changing directory:
# SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web --manifest-path crates/service/storyteller_web/Cargo.toml

build_shared_database_library() {
  pushd crates/lib/database_queries
  SQLX_OFFLINE=true cargo sqlx prepare
  popd
}

build_storyteller_web_app() {
  # NB: This imports the inference/upload job queries
  # It should also import the shared database lib queries, but something(???) broke.
  pushd crates/service/storyteller_web
  SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web # NB: Because multiple binary targets
  popd
}

build_tts_inference_job() {
  # NB: This imports the inference/upload job queries
  # It should also import the shared database lib queries, but something(???) broke.
  pushd crates/service/tts_inference_job
  SQLX_OFFLINE=true cargo sqlx prepare tts_inference_job
  popd
}

combine_sqlx_queries() {
  # Merge multiple JSON files into a single dictionary.
  # https://stackoverflow.com/a/24904276
  jq -s '.[0] * .[1]' \
    crates/lib/database_queries/sqlx-data.json \
    crates/service/storyteller_web/sqlx-data.json \
    crates/service/tts_inference_job/sqlx-data.json \
    > sqlx-data.json
}

cleanup_temp_files() {
  rm crates/lib/database_queries/sqlx-data.json \
    crates/service/storyteller_web/sqlx-data.json \
    crates/service/tts_inference_job/sqlx-data.json
}

build_shared_database_library
build_storyteller_web_app
build_tts_inference_job
combine_sqlx_queries
cleanup_temp_files

