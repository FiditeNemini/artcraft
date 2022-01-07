storyteller-web
===============

This is the main user account monolith that we'll also bake other pieces into.

Local development
-----------------

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
cargo install sqlx-cli --no-default-features --features mysql
cargo install diesel_cli --no-default-features --features mysql
```

#### Linux database notes

If MySql in local dev can't be connected to, reset the accounts:

https://linuxconfig.org/how-to-reset-root-mysql-mariadb-password-on-ubuntu-20-04-focal-fossa-linux

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

Edit the nginx config file, 

- `/etc/nginx/sites-enabled/storyteller` (linux)
- `/usr/local/etc/nginx/sites-enabled/storyteller` (mac)

```
server {
    listen 80;
    server_name api.jungle.horse;
    location / {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:12345;
        proxy_redirect off;
    }
}
server {
    listen 80;
    server_name jungle.horse;
    location / {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:7000;
        proxy_redirect off;
    }
}


```

And in /etc/hosts,

```
127.0.0.1  jungle.horse
127.0.0.1  api.jungle.horse

```

### Setting up local Nginx with SSL self-signed certs

From https://imagineer.in/blog/https-on-localhost-with-nginx/ , 

```
openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout localhost.key -out localhost.crt
```

Most fields can be blank, but the "Common Name" should be `*.jungle.horse`


Edit the appropriate Nginx config file,

- `/etc/nginx/sites-enabled/storyteller` (linux)
- `/usr/local/etc/nginx/sites-enabled/storyteller` (mac typical)
- `/opt/homebrew/etc/nginx/nginx.conf (mac alternate, w/ homebrew)
- `/opt/homebrew/etc/nginx/servers/storyteller` (mac alternate - this is the one I'm using)

```
events {}
http {
  # upstream backend {
  #   server 127.0.0.1:7000
  # }
  # server {
  #   server_name jungle.horse;
  #   rewrite ^(.*) https://jungle.horse$1 permanent;
  # }
  server {
    listen 443;
    ssl on;
    ssl_certificate      /Users/bt/dev/storyteller/storyteller-web/localhost.crt;
    ssl_certificate_key  /Users/bt/dev/storyteller/storyteller-web/localhost.key;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    server_name: jungle.horse;
    location / {
      proxy_pass http://127.0.0.1:7000
    }
  }
}
server {
    listen 80;
    server_name api.jungle.horse;
    location / {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:12345;
        proxy_redirect off;
    }
}
server {
    listen 80;
    server_name jungle.horse;
    location / {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:7000;
        proxy_redirect off;
    }
}

```

Nginx Mac version:

```
nginx version: nginx/1.21.4
built by clang 13.0.0 (clang-1300.0.29.3)
built with OpenSSL 1.1.1l  24 Aug 2021
TLS SNI support enabled
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

Production
----------

These instructions assume running on GCP.

### Database migrations

1. Set `DATABASE_URL` in `.env` to the production secrets (DO NOT COMMIT!)
2. Run `diesel migration run`

### Setting up public buckets without list permission

Public buckets that deny the `list` action should use the following Role:

`roles/storage.legacyObjectReader`

See:

* https://stackoverflow.com/a/56354633
* https://cloud.google.com/storage/docs/access-control/making-data-public#buckets

### Generating Bucket Access Key and Secret Key

https://cloud.telestream.net/tutorials/how-to-setting-up-google-cloud-storage/

1. Go to the GCS page
2. Click "settings"
3. Click "interoperability" tab
4. (enable interoperable access if not already set)
5. Click "create new key"

Actix notes
-----------

json request
```
async fn handler(request: web::Json<Mytype>) -> impl Responder { "whatever" }
```

form-multipart request
```
async fn handler(request: web::Form<Mytype>) -> impl Responder { "whatever" }
```

route parameters
```
#[get("/{name}")]
async fn hello(name: web::Path<String>) -> impl Responder { format!("Hi {}", name) }
```

TODO
----

* Revise this README to be more useful.

Notes / TODOs:

* Examples for good Actix+Sqlx Tests:
  https://stackoverflow.com/questions/65370752/how-do-i-create-an-actix-web-server-that-accepts-both-sqlx-database-pools-and-tr

* Actix/sqlx runtime compat:
  https://github.com/launchbadge/sqlx/issues/1117#issuecomment-801237734
  
* Redis caching

* Jobs for analytics queries


Docker builds
-------------

The repository needs to be given read access to the base docker image:

https://github.com/orgs/storytold/packages/container/docker-base-images-rust-ssl/settings

