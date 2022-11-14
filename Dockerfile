# Custom base image
# Make sure to add this repository so it has read acces to the base image:
# https://github.com/orgs/storytold/packages/container/docker-base-images-rust-ssl/settings/actions_access
# FROM ghcr.io/storytold/docker-base-images-rust-ssl:d94ce4350c3b as rust-build
FROM ubuntu:jammy as rust-base

WORKDIR /tmp

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get install -y \
        build-essential \
        curl \
        libssl-dev \
        pkg-config \
        unzip \
        wget

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y

# Report Rust version for debugging
RUN $HOME/.cargo/bin/rustup show
RUN $HOME/.cargo/bin/rustc --version
RUN $HOME/.cargo/bin/cargo --version

# Cargo Chef does Rust build caching: https://github.com/LukeMathWalker/cargo-chef
RUN $HOME/.cargo/bin/cargo install cargo-chef --locked


FROM rust-base AS planner

COPY . .
RUN $HOME/.cargo/bin/cargo chef prepare --recipe-path recipe.json

FROM rust-base AS builder

COPY --from=planner /tmp/recipe.json recipe.json

# NB: This step builds and caches the dependencies as its own layer.
RUN $HOME/.cargo/bin/cargo chef cook --release --recipe-path recipe.json

# NB: Now we build and test our code.
COPY . .

# Run all of the tests
RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo test

# Build all the binaries.
RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin storyteller-web

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin tts-download-job

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin w2l-download-job

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin generic-download-job

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin tts-inference-job

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin w2l-inference-job

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin websocket-gateway

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin twitch-pubsub-subscriber

# Final image
FROM ubuntu:jammy as final

# See: https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL org.opencontainers.image.authors='bt@brand.io, echelon@gmail.com'
LABEL org.opencontainers.image.url='https://github.com/storytold/storyteller-web'
LABEL org.opencontainers.image.documentation='https://github.com/storytold/storyteller-web'
LABEL org.opencontainers.image.source='https://github.com/storytold/storyteller-web'

WORKDIR /

# Give the container its version so it can report over HTTP.
ARG GIT_SHA
RUN echo -n ${GIT_SHA} > GIT_SHA

# Copy all the binaries.
COPY --from=builder /tmp/target/release/storyteller-web /
COPY --from=builder /tmp/target/release/tts-download-job /
COPY --from=builder /tmp/target/release/tts-inference-job /
COPY --from=builder /tmp/target/release/w2l-download-job /
COPY --from=builder /tmp/target/release/w2l-inference-job /
COPY --from=builder /tmp/target/release/websocket-gateway /
COPY --from=builder /tmp/target/release/twitch-pubsub-subscriber /
COPY --from=builder /tmp/target/release/generic-download-job /

# SSL certs are required for crypto
COPY --from=builder /etc/ssl /etc/ssl

# Required dynamically linked libraries
COPY --from=builder /usr/lib/x86_64-linux-gnu/libssl.*             /lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libcrypto.*          /lib/x86_64-linux-gnu/

# Make sure all the links resolve
RUN ldd storyteller-web

# Without a .env file, Rust crashes "mysteriously" (ugh)
RUN touch .env
RUN touch .env-secrets

EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /storyteller-web

