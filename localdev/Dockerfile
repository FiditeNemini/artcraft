FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        mysql-client \
        imagemagick  \
        libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

FROM rust:latest

RUN cargo install diesel_cli --features mysql && \
  cargo install sqlx-cli --features mysql

WORKDIR /storyteller-rust

COPY Cargo.lock .
COPY Cargo.toml .
COPY sqlx-data.json .
COPY crates/ ./crates
COPY db/ ./db
COPY _migrations ./migrations

WORKDIR /storyteller-rust

RUN cargo build --release --bin storyteller-web --bin tts-download-job --bin w2l-download-job --bin tts-inference-job --bin w2l-inference-job --bin websocket-gateway --bin twitch-pubsub-subscriber

COPY localdev/startup.sh ./startup.sh

CMD ["./startup.sh"]

