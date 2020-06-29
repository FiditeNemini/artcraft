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
        pkg-config
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y

COPY Cargo.lock . 
COPY Cargo.toml .
COPY src/ ./src

RUN $HOME/.cargo/bin/cargo fetch

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

# Copy curl utility
COPY --from=build /usr/bin/curl                              /usr/bin/
COPY --from=build /lib/x86_64-linux-gnu/libcurl.*            /lib/x86_64-linux-gnu/

# Make sure all the links resolve
RUN ldd tts-service-proxy

EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /tts-service-proxy

