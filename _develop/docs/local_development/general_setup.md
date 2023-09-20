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

1) Install Rust [using this guide](https://www.rust-lang.org/learn/get-started).

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

Mac Setup (tested on Apple M2 Silicon)
--------------------------------------

1) Install Rust [using this guide](https://www.rust-lang.org/learn/get-started).

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
