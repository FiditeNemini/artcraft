# Unsure if I want to create minimal images yet that run under Alpine Linux.
# I have instructions for that here: https://hub.docker.com/r/echelon/testcontainer/dockerfile
FROM ubuntu:xenial as build
WORKDIR /tmp
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        curl \
        libssl-dev \
        libssl1.0.0 \
        pkg-config \
        unzip \
        wget
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y

COPY Cargo.lock . 
COPY Cargo.toml .
COPY src/ ./src
COPY script/ ./script

RUN $HOME/.cargo/bin/cargo fetch

#RUN $HOME/.cargo/bin/cargo build
RUN $HOME/.cargo/bin/cargo build --release

# Final image
FROM ubuntu:xenial
WORKDIR /
# SSL certs are required to make requests
COPY --from=build /etc/ssl /etc/ssl
# Shared libs are necessary
COPY --from=build /lib/x86_64-linux-gnu/libssl.so.1.0.0 /lib/x86_64-linux-gnu
COPY --from=build /lib/x86_64-linux-gnu/libcrypto.so.1.0.0 /lib/x86_64-linux-gnu
#COPY --from=build /tmp/target/debug/do_spaces_downloader /
COPY --from=build /tmp/target/release/do_spaces_downloader /
COPY --from=build /tmp/script /

CMD LD_LIBRARY_PATH=/usr/lib /do_spaces_downloader

