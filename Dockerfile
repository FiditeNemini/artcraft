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

RUN wget https://download.pytorch.org/libtorch/cpu/libtorch-cxx11-abi-shared-with-deps-1.3.1%2Bcpu.zip
RUN ls
RUN unzip libtorch-cxx11-abi-shared-with-deps-1.3.1+cpu.zip
#RUN cd libtorch/lib && ls -lA && mv libgomp-*.so.1 libgomp.so.1 && cd /tmp
RUN cd libtorch/lib && ls -lA && ln -s libgomp-753e6e92.so.1 libgomp.so.1 && cd /tmp
RUN ls -lA libtorch/lib
#RUN mv libtorch/lib /lib
RUN cp -R libtorch/lib /usr
RUN ls -lA /usr/lib

RUN LD_LIBRARY_PATH=/usr/lib:${LD_LIBRARY_PATH} $HOME/.cargo/bin/cargo build

# Final image
FROM ubuntu:xenial
WORKDIR /
COPY --from=build /tmp/target/debug/tts_service /
#COPY --from=build /tmp/libtorch /libtorch
COPY --from=build /tmp/libtorch/lib /usr/lib
RUN ls
RUN echo lib
RUN ls -lA /usr/lib
RUN echo $LD_LIBRARY_PATH
RUN ldd tts_service
EXPOSE 8080
#CMD LIBTORCH=/libtorch LD_LIBRARY_PATH=${LIBTORCH}/lib:$LD_LIBRARY_PATH /tts_service
CMD LD_LIBRARY_PATH=/usr/lib /tts_service
