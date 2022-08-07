#!/bin/sh
diesel migration run --database-url="${MYSQL_URL}"
cargo run --release --bin storyteller-web

