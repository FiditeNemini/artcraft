FROM ubuntu:focal as build

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /build

RUN apt-get update \
    && apt-get install -y \
        build-essential \
        curl \
        ffmpeg \
        gdb \
        libssl-dev \
        libssl1.1 \
        pkg-config \
        unzip \
        vim \
        wget

RUN apt-cache search libssl | grep libssl

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y

COPY Cargo.toml .

# Prefetch dependencies so code iteration is fast
RUN $HOME/.cargo/bin/cargo fetch

# Pre-build the dependencies.
# Code changes won't make us rebuild them.
RUN set -x \
  && mkdir -p src \
  && echo 'fn main() { println!("rebuild me!"); }' > src/main.rs \
  && $HOME/.cargo/bin/cargo build --release

# Static image assets
COPY assets/ assets/

# Code
COPY src/ src/

# If the timestamps are older on actual src/ files than
# cached "fake build" above, nothing gets built.
RUN touch src/main.rs

RUN $HOME/.cargo/bin/cargo build --release

