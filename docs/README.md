FakeYou API
===========

Our API is freely available for you to use, though it is IP rate limited to prevent abuse. 

We will provide API tokens for use in the HTTP `Authorization:` header soon as a means to bypass 
rate limiting as well as access your privately uploaded voice models.

## A note about tokens

All of the entities in our database model have Crockford-encoded token primary key identifiers. 
We uniquely prefix each entity type to keep tokens recognizable, but you should treat the tokens 
as *opaque strings*. That is, do not validate the prefix (eg. `U:`) to assert that a given 
token (eg. `U:E00D2RD3ZNZ7P`) is a user. These are only helpful for human debugging.

## Text to Speech

### Get a list of voices

To download a list of all public voices, make a GET request to the following URL.

Note that the full model details are not available directly from the `/tts/list` API, 
and you'll have to consult the model details API to get usage statistics, etc.

```bash
curl -X GET https://api.fakeyou.com/tts/list | jq
```

Response

```json
[
    {
      // The primary token identifier for the model.
      // This is what you use to reference and utilize the model.
      "model_token": "TM:pgdraamqpbke",

      // The type of synthesizer (options: tacotron2, glowtts, etc.)
      "tts_model_type": "tacotron2",

      // The primary token identifier of the user that created the model
      "creator_user_token": "U:E00D2RD3ZNZ7P",

      // The username of the creator (always lowercase)
      "creator_username": "vegito1089",

      // The display name of the creator (mixed case)
      "creator_display_name": "Vegito1089",

      // Gravatar.com hash for the user (if available)
      "creator_gravatar_hash": "bb9ba8158540e90f68de0f4fd380e8c6",

      // Name of the model. This is user-specified and typically contains 
      // additional details. Since FakeYou operates kind of like YouTube, 
      // we allow users full reign over the title and also allow multiple 
      // models of the same voice to be uploaded.
      // We may be adding additional fields with stricter conventions to 
      // identify characters, voice actors, etc. in the future.
      "title": "Frieza (Chris Ayres)",

      // Whether the voice is highlighted on FakeYou.com
      "is_front_page_featured": false,

      // Whether the voice is highlighted on Twitch
      "is_twitch_featured": false,

      // Categories this voice belongs to
      "category_tokens": [
        "CAT:53207996q0v",
        "CAT:dftstewmv3d",
        "CAT:7d9s1fzc15h"
      ],

      // Model upload date
      "created_at": "2022-01-17T01:03:22Z",

      // Model last edit date
      "updated_at": "2022-01-17T01:07:36Z"
    },
    // ...
]
```