FakeYou dev setup (bare metal)
==============================

This document describes how to run the FakeYou infrastructure on your development 
machine's bare metal (no containers). 

The applications (binary targets) you might be interested in running include:

- `storyteller-web`, the HTTP API server
- `download-job`, which downloads models from the web and stores them in GCS
- `inference-job`, which downloads models from GCS and executes them

Linux Setup (tested on Ubuntu 22.04)
------------------------------------

1) Install Rust [using this guide](https://www.rust-lang.org/learn/get-started). If it asks, you'll want "stable"
    Rust, not "nightly" Rust. If it doesn't ask, it defaults to "stable".

2) Install the following libraries and MySQL server:

    ```bash
    sudo apt install \ 
      jq \
      libmysqlclient-dev \
      libsqlite3-dev \
      mysql-server \
      pkgconf
    ```

    (Note: jq is for combining mysql codegen outputs; pkgconf is if using openssl instead of rustls.)

3) Install a `storyteller` user and table

   Connect to mysql:

    ```bash
    # If the following command asks for a password, the password is typically "root"
    sudo mysql -u root -p
    ```

   Once in MySQL, run the following:

    ```mysql
    use mysql;
    CREATE DATABASE storyteller;
    CREATE USER 'storyteller'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL PRIVILEGES ON storyteller.* TO 'storyteller'@'localhost';
    ```

   Then verify access with `./dev_mysql_connect.sh`

4) Install Diesel CLI (for MySQL migrations):

    ```bash
    cargo install diesel_cli \
      --no-default-features \
      --features mysql,sqlite
    ```

5) Run the pending database migrations:

    ```bash
    diesel migration run
    ```
   
    You might get a scary message about `"Encountered unknown type for Mysql: enum"` -- you can ignore this 
    error (see below).

6) (optional) Install the SQLx CLI (if doing database development)

    ```bash
    cargo install sqlx-cli --no-default-features --features rustls,mysql,sqlite
    ```

    We'll be using diesel to manage the migrations, but sqlx within the app to actually perform queries.
    Diesel is an immature ORM, which isn't a good tech bet, so we use sqlx as at-compile-time
    typesafe SQL.

7) Install hosts file:

    If you're developing against the frontend, it'll target development domains (eg. `dev.fakeyou.com`) instead 
    of `127.0.0.1` or `localhost`. You can make your machine route domains to localhost by editing your hosts 
    file (located at `/etc/hosts`) to include the following configuration lines:

    ```
    127.0.0.1    dev.fakeyou.com
    127.0.0.1    api.dev.fakeyou.com
    127.0.0.1    devproxy.fakeyou.com

    127.0.0.1    dev.storyteller.ai
    127.0.0.1    api.dev.storyteller.ai
    127.0.0.1    devproxy.storyteller.ai
    ```

8) Run one or more applications:

   To start the HTTP API server,

    ```bash
    cargo run --bin storyteller-web
    ```

   Note that this compiles and runs the "development" binary. It's faster and easier to debug than the
   optimized "production" build. To build a fully optimized production release,
   run `cargo build --release --bin storyteller-web` . Note that this will take much longer.

   To download some ML models, run:

    ```bash
    cargo run --bin download-job
    cargo run --bin tts-download-job
    ```

   If you want to run both the HTTP API and the jobs, you'll need to run both processes in different
   terminals or tmux sessions.

   Note also that the configurations pointing to the ML monorepo must be set up for each application.
   Additionally, some development secrets may be needed (ask the team to share).

   To execute ML inference, run:

    ```bash
    cargo run --bin inference-job
    cargo run --bin tts-inference-job
    ```

   Again, note that the configurations pointing to the ML monorepo must be set up for each application.
   Additionally, some development secrets may be needed (ask the team to share).


Mac Setup (tested on Apple M2 Silicon)
--------------------------------------

1) Install Rust [using this guide](https://www.rust-lang.org/learn/get-started). If it asks, you'll want "stable"
   Rust, not "nightly" Rust. If it doesn't ask, it defaults to "stable".

2) Install MySQL server:

    ```bash
    brew install mysql
    ```

    If `mysql -uroot` fails, reboot the machine:

    ```bash
    sudo reboot now
    ```

3) Install a `storyteller` user and table

    Connect to mysql:

    ```bash
    # If the following command asks for a password, the password is typically "root"
    sudo mysql -u root -p
    ```

    Once in MySQL, run the following:

    ```mysql
    use mysql;
    CREATE DATABASE storyteller;
    CREATE USER 'storyteller'@'localhost' IDENTIFIED BY 'password';
    GRANT ALL PRIVILEGES ON storyteller.* TO 'storyteller'@'localhost';
    ```

    Then verify access with `./dev_mysql_connect.sh`

4) Install Diesel CLI (for MySQL migrations):

    ```bash
    cargo install diesel_cli \
      --no-default-features \
      --features mysql,sqlite
    ```

    As of this writing, Mac [has some issues with Diesel CLI](https://github.com/diesel-rs/diesel/issues/2605)
    and requires a few dependencies to be installed:

    ```bash
    brew install libpq
    ```

5) Run the pending database migrations:

    ```bash
    diesel migration run
    ```

    You might get a scary message about `"Encountered unknown type for Mysql: enum"` -- you can ignore this 
    error (see below).

6) (optional) Install the SQLx CLI (if doing database development)

    ```bash
    cargo install sqlx-cli --no-default-features --features rustls,mysql,sqlite
    ```
   
    We'll be using diesel to manage the migrations, but sqlx within the app to actually perform queries.
    Diesel is an immature ORM, which isn't a good tech bet, so we use sqlx as at-compile-time
    typesafe SQL.

7) Install hosts file:

    If you're developing against the frontend, it'll target development domains (eg. `dev.fakeyou.com`) instead
    of `127.0.0.1` or `localhost`. You can make your machine route domains to localhost by editing your hosts
    file (located at `/etc/hosts`) to include the following configuration lines:

    ```
    127.0.0.1    dev.fakeyou.com
    127.0.0.1    api.dev.fakeyou.com
    127.0.0.1    devproxy.fakeyou.com

    127.0.0.1    dev.storyteller.ai
    127.0.0.1    api.dev.storyteller.ai
    127.0.0.1    devproxy.storyteller.ai
    ```

8) Run one or more applications:

    To start the HTTP API server,

    ```bash
    cargo run --bin storyteller-web
    ```
   
    Note that this compiles and runs the "development" binary. It's faster and easier to debug than the 
    optimized "production" build. To build a fully optimized production release, 
    run `cargo build --release --bin storyteller-web` . Note that this will take much longer.

    To download some ML models, run:

    ```bash
    cargo run --bin download-job
    cargo run --bin tts-download-job
    ```
   
    If you want to run both the HTTP API and the jobs, you'll need to run both processes in different 
    terminals or tmux sessions.

    Note also that the configurations pointing to the ML monorepo must be set up for each application.
    Additionally, some development secrets may be needed (ask the team to share).

    To execute ML inference, run:

    ```bash
    cargo run --bin inference-job
    cargo run --bin tts-inference-job
    ```

    Again, note that the configurations pointing to the ML monorepo must be set up for each application.
    Additionally, some development secrets may be needed (ask the team to share).


Windows Setup
-------------

(TBD)

Solutions to Common Setup Problems 
-----------------------------------

### [Fix] Sqlx Error on Linux when Performing Schema Migrations

You might get this error message during migration,

```
Encountered unknown type for Mysql: enum
thread 'main' panicked at 'internal error: entered unreachable code: Mysql only supports a closed set of types.
                         If you ever see this error message please open an issue at https://github.com/diesel-rs/diesel 
                         containing a dump of your schema definition.', diesel_cli/src/print_schema.rs:310:17
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

I haven't found the cause (it doesn't happen on newer installs), but the migrations appear to work regardless 
of this error message. You can essentially ignore it.

### [Fix] Can't connect to local MySQL after install on Ubuntu

- If MySql in local dev can't be connected to, [reset the accounts](https://linuxconfig.org/how-to-reset-root-mysql-mariadb-password-on-ubuntu-20-04-focal-fossa-linux).
