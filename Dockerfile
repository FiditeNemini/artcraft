# Unsure if I want to create minimal images yet that run under Alpine Linux.
# I have instructions for that here: https://hub.docker.com/r/echelon/testcontainer/dockerfile
FROM ubuntu:xenial as build
WORKDIR /tmp

# libpcre3-dev is for newrelic
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        curl \
        libpcre3-dev \
        libssl-dev \
        libssl1.0.0 \
        pkg-config

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y

COPY Cargo.lock .
COPY Cargo.toml .
COPY src/ ./src

RUN $HOME/.cargo/bin/cargo fetch

RUN curl https://github.com/newrelic/c-sdk/archive/v1.3.0.tar.gz -L -o newrelic.tar.gz
RUN tar -xf newrelic.tar.gz

# NB: There's also a dynamic library target
# Static output is './c-sdk-1.3.0/libnewrelic.a'
RUN cd ./c-sdk-1.3.0 && make static
RUN cp ./c-sdk-1.3.0/libnewrelic.a .

#RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build
RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build --release

# Final image
FROM ubuntu:xenial
WORKDIR /

#COPY --from=build /tmp/target/debug/tts-service-proxy /
COPY --from=build /tmp/target/release/tts-service-proxy /

# SSL certs are required for crypto
COPY --from=build /etc/ssl /etc/ssl

# Required dynamically linked libraries
COPY --from=build /lib/x86_64-linux-gnu/libssl.*             /lib/x86_64-linux-gnu/
COPY --from=build /lib/x86_64-linux-gnu/libcrypto.*          /lib/x86_64-linux-gnu/

# Make sure all the links resolve
RUN ldd tts-service-proxy

# Install things we want in the final container
RUN apt-get update \
    && apt-get install -y \
        curl \
    && apt-get clean

COPY proxy_configs.toml .

EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /tts-service-proxy

