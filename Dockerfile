# Unsure if I want to create minimal images yet that run under Alpine Linux.
# I have instructions for that here: https://hub.docker.com/r/echelon/testcontainer/dockerfile
FROM ubuntu:xenial as build
WORKDIR /tmp
RUN apt-get update \
    && apt-get install -y \
        build-essential \
        curl \
        libssl-dev \
        pkg-config \
        unzip \
        wget
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh  -s -- --default-toolchain stable -y
COPY Cargo.lock . 
COPY tts_service/Cargo.toml .
COPY tts_service/src/ ./src

RUN $HOME/.cargo/bin/cargo fetch

# Libtorch package index: https://pytorch.org/get-started/locally/
# tch.rs wants libtorch version 1.5 now.
RUN wget https://download.pytorch.org/libtorch/cpu/libtorch-cxx11-abi-shared-with-deps-1.5.0%2Bcpu.zip
RUN unzip libtorch-cxx11-abi-shared-with-deps-1.5.0+cpu.zip

RUN cd libtorch/lib && ls -lA && ln -s libgomp-75eea7e8.so.1 libgomp.so.1 && cd /tmp
RUN cp -R libtorch/lib /usr

#RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build
RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build --release

# Final image
FROM ubuntu:xenial
WORKDIR /
#COPY --from=build /tmp/target/debug/tts_service /
COPY --from=build /tmp/target/release/tts_service /
COPY --from=build /tmp/libtorch/lib /usr/lib
RUN ldd tts_service
EXPOSE 8080
CMD LD_LIBRARY_PATH=/usr/lib /tts_service

