dev setup
=========

[Back to main README](../README.md)

### Debugging and Fixing CUDA/PyTorch

See this spreadsheet for previous battles with version incompatibility:
https://docs.google.com/spreadsheets/d/1BEdLmwOzo3r83-iJn9sj6co1VT92t3lIeJ-lNH25bdQ/edit#gid=0

Ubuntu might upgrade the driver by accident, and it might need reinstallation. Who knows.
This stuff is a nightmare.

### Database Setup

Install the following libraries, and see the notes further below about MySQL on Ubuntu 20.04.

```
mysql-server
imagemagick
```

To manage the database and perform migrations, install the Rust tools diesel and sqlx.

We'll be using diesel to manage the migrations, but sqlx within the app to actually perform queries.
Diesel is an ORM, which is dumb, so we use sqlx as at-compile-time typesafe SQL.

```
sudo apt-get install libmysqlclient-dev
cargo install sqlx-cli --no-default-features --features rustls,mysql [2022-01-16: is this needed?]
```

Diesel now supports configuring the migration directory via an environment variable,
so we can install the currently published version:

```
cargo install diesel_cli \
  --no-default-features \
  --features mysql
```

If the modern version fails, try installing a cherry-picked version with a 
TOML-based migration directory configuration:

```
cargo install diesel_cli \
  --git https://github.com/diesel-rs/diesel.git \
  --rev a213fe232a122f35a812b0ce0269708a1845a4c9 \
  --no-default-features \
  --features mysql
```

#### Sqlx Error on Linux when Performing Schema Migrations

You might get this error message during migration,

```
Encountered unknown type for Mysql: enum
thread 'main' panicked at 'internal error: entered unreachable code: Mysql only supports a closed set of types.
                         If you ever see this error message please open an issue at https://github.com/diesel-rs/diesel containing a dump of your schema definition.', diesel_cli/src/print_schema.rs:310:17
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

I haven't found the cause (it doesn't happen on Mac), but the migrations appear to work regardless of the error message.

#### Linux database notes

If MySql in local dev can't be connected to, reset the accounts:

https://linuxconfig.org/how-to-reset-root-mysql-mariadb-password-on-ubuntu-20-04-focal-fossa-linux

#### MySql on Ubuntu 22.04

Should work largely out of the box. We'll need a dev account:

```
# Connect to mysql:
# sudo mysql -u root -p (password is "root")

use mysql;
CREATE USER 'storyteller'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON storyteller.* TO 'storyteller'@'localhost';
```

Then verify with `./dev_mysql_connect.sh`

#### Fixing dev MySql on Ubuntu 20.04

For some reason, the MySql default install on 20.04 gave me a bunch of trouble.

In retrospect, I _think_ this is because 'root@localhost' requires sudo to access, but if this
gives any trouble in the future, here's how I got around it (two full hours of distraction!)

```
sudo apt-get install mysql-server

# But for some reason the default password doesn't work and diesel/sqlx can't connect?

# Kill everything

sudo apt purge mysql-server mysql-client mysql-common
sudo apt autoremove
sudo mv -iv /var/lib/mysql /var/tmp/mysql-backup
sudo rm -rf /var/lib/mysql*

sudo /usr/bin/mysql_secure_installation

# still no work...

sudo systemctl stop mysql.service

# ugh, it wasn't chowned or created (both states observed in different installs)…
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld

sudo mysqld_safe --skip-grant-tables --skip-networking &

mysql -u root

flush privileges;
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';

sudo killall -u mysql
sudo systemctl restart mysql.service

# now it works
sudo mysql -u root -p

# but now I have to use "sudo" !?!?

use mysql;

CREATE USER 'storyteller'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON storyteller.* TO 'storyteller'@'localhost';
```

### Install Diesel (migrations only)

We use Diesel to manage migrations, but we don't use it in server code.
Actual server code uses SQLx. To install the CLI tool, run the following:

```
cargo install diesel_cli
```

Mac [has issues](https://github.com/diesel-rs/diesel/issues/2605) and requires a few dependencies:

```
brew install libpq
```

### Database migrations

To reset the entire database (drop, migrate), run:

```
diesel database reset
```

To migrate at the current step and beyond:

```
diesel migration run
```

To undo migrations at the current step:

```
diesel migration redo
```

### Server Query Codegen

We use SQLx instead of Diesel in the production server. It's typesafe
SQL instead of an ORM like Diesel.

SQLx connects to a database to derive type information, but obviously
cannot do this for builds in CI. In order to cache the types, we build
and check in a cache file (necessary for builds):

```
SQLX_OFFLINE=true cargo sqlx prepare
```

Now that we have multiple binaries, it's required to include all the queries in the main
binary so we can generate the cached queries as a single target. That's then executed
with:

```
SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web
```

### Setting Up a Local Nginx Proxy

Set up a local nginx to proxy to the frontend and backend so cookie issues aren't annoying

Configure Nginx per the checked in Nginx configs (and instructions) in `localdev/nginx-http-config`.

```

And in /etc/hosts,

```
127.0.0.1  jungle.horse
127.0.0.1  api.jungle.horse

```

### Python 3.6 on Apple M1 Mac

Python3.6 isn't supported on Apple silicon, and it's not in homebrew. It can be installed with 
[nix using Rosetta](https://stackoverflow.com/a/65980989):

Download: https://nixos.org/download.html#nix-quick-install

```
nix run nixpkgs.python36 -c python
```

Install venv:

```
nix run nixpkgs.python36 -c python -m venv python
```

Install other packages on Mac that aren't used in venv:

```
python3 -m pip install --user requests gdown youtube_dl
```
