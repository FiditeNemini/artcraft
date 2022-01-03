#!/bin/bash

# Necessary since we're now in a more complex Rust workspace
pushd crates/app/storyteller_web

SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web

popd

mv crates/app/storyteller_web/sqlx-data.json . 

