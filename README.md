storyteller-web
===============
This is our main user account monolith that we'll also bake other pieces into.

Local development
-----------------

### Setup development

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

If MySql in local dev can't be connected to, reset the accounts:

https://linuxconfig.org/how-to-reset-root-mysql-mariadb-password-on-ubuntu-20-04-focal-fossa-linux

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

To save sqlx database state to cache file (necessary for builds):

```
SQLX_OFFLINE=true cargo sqlx prepare
```

Now that we have multiple binaries, it's required to include all the queries in the main
binary so we can generate the cached queries as a single target. That's then executed
with:

```
SQLX_OFFLINE=true cargo sqlx prepare -- --bin storyteller-web
```

Production
----------

### Database migrations

1. Set `DATABASE_URL` in `.env` to the production secrets (DO NOT COMMIT!)
2. Run `diesel migration run`

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

* Make all "token" types correct
* Use correct collation for all tables
* Install indexes on all foreign keys
* Make sure unique indexes are correct

Notes / TODOs:

* Examples for good Actix+Sqlx Tests:
  https://stackoverflow.com/questions/65370752/how-do-i-create-an-actix-web-server-that-accepts-both-sqlx-database-pools-and-tr

* Actix/sqlx runtime compat:
  https://github.com/launchbadge/sqlx/issues/1117#issuecomment-801237734


Docker builds
-------------

The repository needs to be given read access to the base docker image:

https://github.com/orgs/storytold/packages/container/docker-base-images-rust-ssl/settings

Local Nginx Proxy
-----------------
Set up a local nginx to proxy to the frontend and backend so cookie issues aren't annoying

Edit, `/etc/nginx/sites-enabled/storyteller`

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

Fixing dev MySql on Ubuntu 20.04
--------------------------------

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

CREATE USER 'storyteller'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON storyteller.* TO 'storyteller'@'localhost';
```

