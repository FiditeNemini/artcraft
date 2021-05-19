storyteller-web
===============
This is our main user account monolith that we'll also bake other pieces into.

Local development
-----------------

### Database migrations

To reset the entire database (drop, migrate), run:

```diesel database reset```

To migrate at the current step and beyond: 

```diesel migration run```

To undo migrations at the current step: 

```diesel migration redo```

To save sqlx database state to cache file (necessary for builds):

```SQLX_OFFLINE=true cargo sqlx prepare```

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


