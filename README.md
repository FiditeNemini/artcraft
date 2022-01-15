storyteller-web
===============

This is the main user account monolith that we'll also bake other pieces into.

Application overview
--------------------

* storyteller_web
  * `storyteller-web` - HTTP + database monolith for FakeYou
  * `tts-download-job` - Async download of models
  * `tts-inference-job` - Async TTS inference
  * `w2l-download-job` - Async download of videos and images
  * `w2l-inference-job` - Async W2L inference
* obs_gateway
  * `obs-gateway-server` - websocket for hosting OBS, twitch pieces (move!)
  * `twitch-pubsub-job` - Subscribes to Twitch PubSub
  * `twitch-chat-job` (*TODO*) - Subscribes to Twitch chat
  * `reddit-chat-job` (*TODO*) - Subscribes to Reddit RPAN chat
* social  
  * `discord-chat-job` (*TODO*) - Subscribes to Reddit RPAN chat
  * `twitter-feed-job` (*TODO*) - Subscribes to Reddit RPAN chat

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


