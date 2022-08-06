#!/bin/sh
diesel migration run --database-url="${DATABASE_URL}"
cargo run --release --bin storyteller-web

