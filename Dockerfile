# Custom base image
# Make sure to add this repository so it has read acces to the base image:
# https://github.com/orgs/storytold/packages/container/docker-base-images-rust-ssl/settings/actions_access
FROM ghcr.io/storytold/docker-base-images-rust-ssl:latest as build
WORKDIR /tmp

COPY Cargo.lock . 
COPY Cargo.toml .
COPY sqlx-data.json .
COPY src/ ./src
COPY migrations/ ./migrations

RUN $HOME/.cargo/bin/cargo fetch

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
  --bin tts-inference-job

RUN SQLX_OFFLINE=true \
  LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} \
  $HOME/.cargo/bin/cargo build \
  --release \
  --bin w2l-inference-job

# Final image
FROM ubuntu:xenial
WORKDIR /

# See: https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL org.opencontainers.image.authors='bt@brand.io, echelon@gmail.com'
LABEL org.opencontainers.image.url='https://github.com/storytold/storyteller-web'
LABEL org.opencontainers.image.documentation='https://github.com/storytold/storyteller-web'
LABEL org.opencontainers.image.source='https://github.com/storytold/storyteller-web'

# NB: Comment this out for non-debug images
# TODO: Figure out how this is done elsewhere with just the static binaries
# Others: `mysql-client`
RUN apt-get update \
    && apt-get install -y \
        curl \
        wget

# Copy all the binaries.
COPY --from=build /tmp/target/release/storyteller-web /
COPY --from=build /tmp/target/release/tts-download-job /
COPY --from=build /tmp/target/release/tts-inference-job /
COPY --from=build /tmp/target/release/w2l-download-job /
COPY --from=build /tmp/target/release/w2l-inference-job /

# SSL certs are required for crypto
COPY --from=build /etc/ssl /etc/ssl

# Required dynamically linked libraries
COPY --from=build /lib/x86_64-linux-gnu/libssl.*             /lib/x86_64-linux-gnu/
COPY --from=build /lib/x86_64-linux-gnu/libcrypto.*          /lib/x86_64-linux-gnu/

# Make sure all the links resolve
RUN ldd storyteller-web

EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /storyteller-web

