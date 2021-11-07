#!/bin/bash
wc -l \
	Cargo.toml \
	Dockerfile \
	migrations/*/*.sql \
	app/*/*/*.rs \
	app/*/*/*/*.rs \
	app/*/*/*/*/*.rs \
	app/*/*/*/*/*/*.rs \
	app/*/*/*/*/*/*/*.rs \
	| sort -n
