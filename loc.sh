#!/bin/bash
wc -l \
	Cargo.toml \
	Dockerfile \
	migrations/*/*.sql \
	crates/*/*/*/*.rs \
	crates/*/*/*/*/*.rs \
	crates/*/*/*/*/*/*.rs \
	crates/*/*/*/*/*/*/*.rs \
	crates/*/*/*/*/*/*/*/*.rs \
	| sort -n
