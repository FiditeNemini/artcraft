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

TODO
----

* Make all "token" types correct
* Use correct collation for all tables
* Install indexes on all foreign keys
* Make sure unique indexes are correct


* Tests: https://stackoverflow.com/questions/65370752/how-do-i-create-an-actix-web-server-that-accepts-both-sqlx-database-pools-and-tr

