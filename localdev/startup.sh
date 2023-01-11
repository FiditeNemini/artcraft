#!/bin/sh
diesel migration run --database-url="${MYSQL_URL}"
./target/x86_64-unknown-linux-musl/release/storyteller-web

