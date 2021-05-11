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
COPY protos/ ./protos

RUN $HOME/.cargo/bin/cargo fetch

#RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build
RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build --release

# Final image
FROM ubuntu:xenial
WORKDIR /

LABEL org.opencontainers.image.authors='bt@brand.io, echelon@gmail.com'
LABEL org.opencontainers.image.url='https://github.com/storytold/twitch-ingestion-client'
LABEL org.opencontainers.image.documentation='https://github.com/storytold/twitch-ingestion-client'
LABEL org.opencontainers.image.source='https://github.com/storytold/twitch-ingestion-client'

# NB: Comment this out for non-debug images
# TODO: Figure out how this is done elsewhere with just the static binaries
RUN apt-get update \
    && apt-get install -y \
        curl \
        wget

#COPY --from=build /tmp/target/debug/twitch-ingestion-client /
COPY --from=build /tmp/target/release/twitch-ingestion-client /

# SSL certs are required for crypto
COPY --from=build /etc/ssl /etc/ssl

# Required dynamically linked libraries
COPY --from=build /lib/x86_64-linux-gnu/libssl.*             /lib/x86_64-linux-gnu/
COPY --from=build /lib/x86_64-linux-gnu/libcrypto.*          /lib/x86_64-linux-gnu/

# Make sure all the links resolve
RUN ldd twitch-ingestion-client

EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /twitch-ingestion-client

