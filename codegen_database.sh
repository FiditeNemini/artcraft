#!/bin/bash

# Necessary since we're now in a more complex Rust workspace
pushd crates/service/storyteller_web

SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web

popd

mv crates/service/storyteller_web/sqlx-data.json . 

