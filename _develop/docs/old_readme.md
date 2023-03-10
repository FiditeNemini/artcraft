old readme
==========

Contents of the main README.md, which will always be woefully out of date. Docs will migrate into this folder on a 
per-subject basis. App-specific docs will live under each app.

Application overview
--------------------

* [FakeYou.com](https://fakeyou.com) is powered by:
    * HTTP APIs:
        * `storyteller-web` - HTTP + database monolith for FakeYou
    * Asynchronous Jobs:
        * `tts-download-job` - Async download of models
        * `tts-inference-job` - Async TTS inference
        * `w2l-download-job` - Async download of videos and images
        * `w2l-inference-job` - Async W2L inference

* [StorytellerStream](https://storyteller.stream) is powered by:
    * HTTP APIs:
        * `storyteller-web` - HTTP + database monolith for FakeYou
    * Websocket events:
        * `websocket-gateway` - Websocket to pull down Twitch events.
    * Twitch API integration:
        * `twitch-pubsub-subscriber` - Dynamically subscribes to Twitch PubSub for "active" users

Schema and API notes
--------------------

* [Redis Schema Notes README](_docs/redis_schema.md)

Local development
-----------------

[Local development setup README](_docs/local_development_setup.md)

Production and Deployment
-------------------------

[Production builds and deployment README](_docs/production_builds_and_deployment.md)

Development notes
-----------------

[Development notes README](_docs/development_notes.md)

Dump a MySQL report
-------------------

```
mysql -u storyteller \
  -pPasswordHere \
  -h IP_HERE \
  -P 3306 \
  -D storyteller \
  -B \
  -e "select * from voice_clone_requests;" | sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g" > voice_clone_report.csv
```

TODO
----

* Revise this README to be more useful.

Notes / TODOs:

* Examples for good Actix+Sqlx Tests:
  https://stackoverflow.com/questions/65370752/how-do-i-create-an-actix-web-server-that-accepts-both-sqlx-database-pools-and-tr

* Actix/sqlx runtime compat:
  https://github.com/launchbadge/sqlx/issues/1117#issuecomment-801237734

* Redis caching of more endpoints

* Jobs for analytics queries (#uses per model, etc)
* Jobs for ingesting Discord, Twitter, Reddit RPAN chat, Twitch chat (not PubSub), etc.

