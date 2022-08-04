# ==================== Python Build Base ====================

FROM ghcr.io/storytold/docker-base-images-nvidia-cuda-experimental:080f96bc7087 as pybuild-base

# The downloader needs youtube-dl as a python library
# NB: No longer maintained: https://news.ycombinator.com/item?id=28319624
#RUN pip3 install --upgrade youtube-dl

# Used by the downloader script.
# And it looks like youtube-dl is dead...
# Per the README, it looks like pip will always pull the latest version.
# https://github.com/yt-dlp/yt-dlp#update
RUN python3 -m pip install --upgrade yt-dlp

# ==================== Python Build Step 2: Wav2Lip Requirements ====================

FROM pybuild-base as pybuild-requirements

WORKDIR /

COPY models/Wav2Lip ./models/Wav2Lip
WORKDIR models/Wav2Lip

# NB: We need Python3.6
RUN python3.6 -m venv python
#RUN virtualenv -p /usr/bin/python3.6  ... wait
RUN . python/bin/activate \
  && pip install --upgrade pip \
  && pip install -r requirements.txt \
  && deactivate

WORKDIR /

COPY models/tts ./models/tts
WORKDIR models/tts

# NB: Not sure if we need Python3.6 for Tacotron2, but Python3.8 gave me trouble.
# NB: Setuptools fix: https://github.com/tensorflow/tensorflow/issues/34302#issuecomment-554450289
RUN python3.6 -m venv python
RUN . python/bin/activate \
  && pip install --upgrade pip setuptools \
  && pip install -r requirements-tacotron-python36.txt \
  && deactivate

# ==================== Rust Build Base ====================

# Custom base image
# Make sure to add this repository so it has read acces to the base image:
# https://github.com/orgs/storytold/packages/container/docker-base-images-rust-ssl/settings/actions_access
FROM ghcr.io/storytold/docker-base-images-rust-ssl:latest as rust-build
WORKDIR /tmp

COPY Cargo.lock . 
COPY Cargo.toml .
COPY sqlx-data.json .
COPY crates/ ./crates
COPY db/ ./db
# TODO(2022-01-16): Might not be necessary:
# COPY _migrations/ ./_migrations

RUN $HOME/.cargo/bin/cargo fetch

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
#  FROM ubuntu:xenial
FROM pybuild-requirements as final
#RUN mkdir /storyteller
#WORKDIR /storyteller
WORKDIR /


COPY scripts/ ./scripts

# See: https://github.com/opencontainers/image-spec/blob/master/annotations.md
LABEL org.opencontainers.image.authors='bt@brand.io, echelon@gmail.com'
LABEL org.opencontainers.image.url='https://github.com/storytold/storyteller-web'
LABEL org.opencontainers.image.documentation='https://github.com/storytold/storyteller-web'
LABEL org.opencontainers.image.source='https://github.com/storytold/storyteller-web'

# NB(echelon,2022-05-31): NVIDIA revoked some of their keys.
# A better long term fix is to remove these dependencies outright and not have ML deps in this repo.
# https://developer.nvidia.com/blog/updating-the-cuda-linux-gpg-repository-key/
# https://forums.developer.nvidia.com/t/invalid-public-key-for-cuda-apt-repository/212901/11
RUN apt-key del 7fa2af80

# NB: Fix for 'E: Conflicting values set for option Signed-By regarding source'
# NB: We need to remove all sources
RUN rm $(find /etc/apt | grep cuda)

#RUN wget https://developer.download.nvidia.com/compute/cuda/repos/$distro/$arch/cuda-keyring_1.0-1_all.deb
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-keyring_1.0-1_all.deb
RUN dpkg -i cuda-keyring_1.0-1_all.deb

# NB: Comment this out for non-debug images
# TODO: Figure out how this is done elsewhere with just the static binaries
# Others: `mysql-client`
RUN apt-get update \
    && apt-get install -y \
        curl \
        python3-pip \
        python3 \
        wget

RUN python3 --version
#RUN python3.7 -m venv python
#RUN . python/bin/activate \
#  && pip install --upgrade pip \
#  && pip install -r requirements.txt


# TODO: Use venv to do this instead.
RUN pip3 install gdown

# Copy all the binaries.
COPY --from=rust-build /tmp/target/release/storyteller-web /
COPY --from=rust-build /tmp/target/release/tts-download-job /
COPY --from=rust-build /tmp/target/release/tts-inference-job /
COPY --from=rust-build /tmp/target/release/w2l-download-job /
COPY --from=rust-build /tmp/target/release/w2l-inference-job /
COPY --from=rust-build /tmp/target/release/websocket-gateway /
COPY --from=rust-build /tmp/target/release/twitch-pubsub-subscriber /

# SSL certs are required for crypto
COPY --from=rust-build /etc/ssl /etc/ssl

# Required dynamically linked libraries
COPY --from=rust-build /lib/x86_64-linux-gnu/libssl.*             /lib/x86_64-linux-gnu/
COPY --from=rust-build /lib/x86_64-linux-gnu/libcrypto.*          /lib/x86_64-linux-gnu/

# Make sure all the links resolve
RUN ldd storyteller-web

# Without a .env file, Rust crashes "mysteriously" (ugh)
RUN touch .env
RUN touch .env-secrets

EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /storyteller-web

# ===================================================================================================
# WAV2LIP WORKER

# ==================== Rust Build Base ====================

#  #FROM ubuntu:xenial as rustbuild-base
#  WORKDIR /tmp
#  RUN apt-get update \
#      && apt-get install -y \
#          build-essential \
#          curl \
#          libssl-dev \
#          libssl1.0.0 \
#          pkg-config \
#          unzip \
#          wget
#  RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
#      | sh  -s -- --default-toolchain stable -y



# ==================== Rust Build Binary ====================

#  FROM rustbuild-base as rustbuild-binary
#
#  COPY Cargo.lock .
#  COPY Cargo.toml .
#  COPY w2l_server ./w2l_server
#  COPY w2l_shared ./w2l_shared
#  COPY w2l_worker ./w2l_worker
#
#  RUN $HOME/.cargo/bin/cargo fetch
#  RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build --release --bin wav2lip_worker

# ==================== Final Image ====================

#  FROM pybuild-requirements as final
#  WORKDIR /
#
#  COPY --from=rustbuild-binary /tmp/target/release/wav2lip_worker     /
#  COPY --from=rustbuild-binary /etc/ssl                               /etc/ssl
#  COPY --from=rustbuild-binary /lib/x86_64-linux-gnu/libssl.*         /lib/x86_64-linux-gnu/
#  COPY --from=rustbuild-binary /lib/x86_64-linux-gnu/libcrypto.*      /lib/x86_64-linux-gnu/
#
#  # Without a .env file, Rust crashes "mysteriously" (ugh)
#  RUN touch .env
#
#  RUN ldd wav2lip_worker
#
#  EXPOSE 8080
#  CMD LD_LIBRARY_PATH=/usr/lib /wav2lip_worker

