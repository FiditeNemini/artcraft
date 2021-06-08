#!/bin/bash
wc -l \
	Cargo.toml \
	Dockerfile \
	migrations/*/*.sql \
	src/*.rs \
	src/*/*.rs \
	src/*/*/*.rs \
	src/*/*/*/*.rs \
	src/*/*/*/*/*.rs \
	| sort -n
