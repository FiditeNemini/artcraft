FakeYou dev setup (bare metal)
==============================

This document describes how to run the FakeYou infrastructure on your development 
machine's bare metal (no containers). 

Database Setup
--------------

### Linux Install

Install the following libraries, and see the notes further below about MySQL on Ubuntu 20.04.

```bash
jq # for combining mysql codegen outputs
libmysqlclient-dev
libsqlite3-dev
mysql-server
pkgconf # if using openssl instead of rustls
```

### Mac Install

```bash
brew install mysql
```

If mysql -uroot fails, reboot the machine:

```bash
sudo reboot now
```

### Database Migrations (Install Tooling)

To manage the database and perform migrations, install the Rust tools diesel and sqlx.

We'll be using diesel to manage the migrations, but sqlx within the app to actually perform queries.
Diesel is an immature ORM, which isn't a good tech bet, so we use sqlx as at-compile-time 
typesafe SQL.

Install the SQLx CLI (Linux + Mac):

```bash
cargo install sqlx-cli --no-default-features --features rustls,mysql,sqlite
```

Install the Diesel CLI (Linux + Mac): 

```bash
cargo install diesel_cli \
  --no-default-features \
  --features mysql,sqlite
```

Mac [has issues](https://github.com/diesel-rs/diesel/issues/2605) and requires a few dependencies to be installed:

```bash
brew install libpq
```

### Database Migrations (Run)

To run pending migrations, execute the following: 

```bash
diesel migration run
```

If you're simply developing against the backend, this will be the only step you need to perform. 

To revert the last 3 migrations:

```bash
diesel migration revert -n 3
```

To reset the entire database (drop, migrate), run:

```bash
diesel database reset
```

### Server Query Codegen

We use SQLx instead of Diesel in the production server. It's typesafe
SQL instead of an ORM like Diesel.

SQLx connects to a database to derive type information, but obviously
cannot do this for builds in CI. In order to cache the types, we build
and check in a cache file (necessary for builds):

```bash
SQLX_OFFLINE=true cargo sqlx prepare
```

Now that we have multiple binaries, it's required to include all the queries in the main
binary so we can generate the cached queries as a single target. That's then executed
with:

```bash
SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web
```

### [Fix] Sqlx Error on Linux when Performing Schema Migrations

You might get this error message during migration,

```
Encountered unknown type for Mysql: enum
thread 'main' panicked at 'internal error: entered unreachable code: Mysql only supports a closed set of types.
                         If you ever see this error message please open an issue at https://github.com/diesel-rs/diesel containing a dump of your schema definition.', diesel_cli/src/print_schema.rs:310:17
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

I haven't found the cause (it doesn't happen on Mac), but the migrations appear to work regardless 
of this error message. You can essentially ignore it.

### [Fix] Can't connect to local MySQL after install on Ubuntu

- If MySql in local dev can't be connected to, [reset the accounts](https://linuxconfig.org/how-to-reset-root-mysql-mariadb-password-on-ubuntu-20-04-focal-fossa-linux).

### [Fix] MySql on Ubuntu 22.04

Should work largely out of the box. We'll need a dev account:

```bash
# Connect to mysql:
# sudo mysql -u root -p (password is "root")

use mysql;
CREATE USER 'storyteller'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON storyteller.* TO 'storyteller'@'localhost';
```

Then verify with `./dev_mysql_connect.sh`
