FakeYou API
===========

Our API is freely available for you to use, though it is IP rate limited to prevent abuse. 

We will provide API tokens for use in the HTTP `Authorization:` header soon as a means to bypass 
rate limiting as well as access your privately uploaded voice models.

## Text to Speech

### Get a list of voices

To download a list of all public voices, make a GET request to the following:

```bash
curl -X GET https://api.fakeyou.com/tts/list | jq
```

Response

```jsonc
[
    {
      # The primary token identifier for the model
      "model_token": "TM:pgdraamqpbke",
      # The type of synthesizer (options: tacotron2, glowtts, etc.)
      "tts_model_type": "tacotron2",
      # The primary token identifier of the user that created the model
      "creator_user_token": "U:E00D2RD3ZNZ7P",
      # The username of the creator (always lowercase)
      "creator_username": "vegito1089",
      # The display name of the creator (mixed case)
      "creator_display_name": "Vegito1089",
      # Gravatar.com hash for the user (if available)
      "creator_gravatar_hash": "bb9ba8158540e90f68de0f4fd380e8c6",
      # Name of the model. This is user-specified and typically contains additional details.
      "title": "Frieza (Chris Ayres)",
      # Whether the voice is highlighted on FakeYou.com
      "is_front_page_featured": false,
      # Whether the voice is highlighted on Twitch
      "is_twitch_featured": false,
      # Categories this voice belongs to
      "category_tokens": [
        "CAT:53207996q0v"
      ],
      # Model upload date
      "created_at": "2022-01-17T01:03:22Z",
      # Model last edit date
      "updated_at": "2022-01-17T01:07:36Z"
    },
    {
      "model_token": "TM:dm8c946pxxmp",
      "tts_model_type": "tacotron2",
      "creator_user_token": "U:XXBKSCB29A6G4",
      "creator_username": "dinowattz",
      "creator_display_name": "dinowattz",
      "creator_gravatar_hash": "07a6cc61c22b82d9b6ed9a5a8fc3115c",
      "title": "Phoenix Wright (Ultimate Marvel vs. Capcom 3, Sam Riegel)",
      "is_front_page_featured": false,
      "is_twitch_featured": false,
      "category_tokens": [
        "CAT:dftstewmv3d",
        "CAT:7d9s1fzc15h"
      ],
      "created_at": "2021-11-26T11:11:26Z",
      "updated_at": "2022-01-05T07:15:04Z"
    },
]
```