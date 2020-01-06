# Unsure if I want to create minimal images yet that run under Alpine Linux.
# I have instructions for that here: https://hub.docker.com/r/echelon/testcontainer/dockerfile
FROM ubuntu:xenial
WORKDIR /tmp
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        curl \
        libssl-dev \
        pkg-config
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y
COPY Cargo.lock . 
COPY tts_service/Cargo.toml .
COPY tts_service/src/ ./src
RUN $HOME/.cargo/bin/cargo fetch
RUN $HOME/.cargo/bin/cargo build
RUN mv /tmp/target/debug/tts_service /
WORKDIR /
EXPOSE 8080
CMD /tts_service
