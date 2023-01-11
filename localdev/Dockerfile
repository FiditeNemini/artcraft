FROM rust:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        mariadb-client \
        imagemagick  \
        libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*


RUN cargo install diesel_cli --features mysql && \
  cargo install sqlx-cli --features mysql

WORKDIR /storyteller-rust

ARG GIT_SHA

RUN echo -n ${GIT_SHA} > /GIT_SHA

CMD ["/storyteller-rust/localdev/startup.sh"]

