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

### Make a TTS request

To turn text into speech with your desired voice, you'll need to find the appropriate TTS model token 
from the lookup API. 

For example, `TM:7wbtjphx8h8v` in the following examples is our `Mario *` voice. (A paid voice actor 
that we hired to impersonate Mario).

```bash
curl -X POST 'https://api.fakeyou.com/tts/inference' 

 -H 'Accept: application/json' \
 -H 'Content-Type: application/json' \
 --data-raw '{"uuid_idempotency_token":"entropy","tts_model_token":"TM:7wbtjphx8h8v","inference_text":"Testing"}'
```

A closer look at the request payload,

```json
{
  // The primary key token identifier of the model you want to use. 
  // This can be looked up in the aforementioned list endpoint.
  "tts_model_token": "TM:7wbtjphx8h8v",

  // A random value that can only be used once!
  // 
  // Any subsequent request with the same idempotency token will fail outright.
  // The reason for this is so that frontend "create" APIs won't accidentally resubmit 
  // the same request twice.
  //
  // This payload doesn't have to be a UUID, but we recommend uuid V4 (or a more modern 
  // algorithm that makes better use of entropy). The chances that your request will fail due 
  // to duplicate UUIDs is infinitsimal, so set it and don't worry about it.
  //
  // Notably, the UUID has a maximum length of 36 characters.
  "uuid_idempotency_token": "9cdd9865-0e10-48f0-9a23-861118ec3286",

  // The text to be synthesized into audio.
  // We have a slur filter, but you'll also want to sanitize the input on your end.
  "inference_text": "I'll only say the things you want me to say, and nothing more."
}
```

And the response it initially gives back,

```json
{
  // Whether the request was successful
  "success": true,

  // The token to look up the results.
  // You'll use this to poll an API to see if your request has finished processing.
  "inference_job_token": "JTINF:qsy72wnfashhvnkktc16y49cy1"
}
```

### Poll TTS request status

Once you've submitted your TTS request, you'll want to poll for completion.

```bash
curl -X GET 'https://api.fakeyou.com/tts/job/{INFERENCE_JOB_TOKEN}' \
  -H 'Accept: application/json' | jq
```

Or filled out with an actual token,

```bash
curl -X GET 'https://api.fakeyou.com/tts/job/JTINF:qsy72wnfashhvnkktc16y49cy1' \
  -H 'Accept: application/json' | jq
```

The response looks like this while the results are processing,

```json
{
  // Whether the request succeeded
  "success": true,

  // Container for the job state record
  "state": {

    // Simply returns the same job token you supplied
    "job_token": "JTINF:qsy72wnfashhvnkktc16y49cy1",

    // The overall status of the job. 
    // 
    // Job states are as follows:
    //
    //  - "pending": job is waiting to run
    //  - "started": job is processing now
    //  - "complete_success": the job ran to completion
    //        successfully and you have audio results
    //  - "complete_failure": the job failed in a knowably
    //        non-repeatable way and will not be retried.
    //  - "attempt_failed": the job failed once, but it's
    //        recoverable and we'll retry again soon.
    //  - "dead": retry attempts were exhausted and the job
    //        will not be retried further.
    //
    // As a state machine:
    //
    // Pending -> Started -> Complete_Success
    //                    |-> Complete_Failure
    //                    \-> Attempt_Failed -> Started -> { Complete, Failed, Dead }
    "status": "pending",

    // During processing, this may be a human-readable string
    // to describe the execution status. 
    "maybe_extra_status_description": null,

    // The number of attempts we've made to render the audio.
    "attempt_count": 0,

    // If there are results, this is the token you'll use to 
    // look up more details (wav file, spectrogram, duration, 
    // execution statistics, etc.)
    "maybe_result_token": null,

    // If there are results, this will show the path to the 
    // wav file. You can use this to avoid looking up the audio
    // record directly in another API call.
    "maybe_public_bucket_wav_audio_path": null,

    // Voice (tts model) that was used to synthesize the audio.
    "model_token": "TM:7wbtjphx8h8v",

    // The synthesizer architecture
    "tts_model_type": "tacotron2",

    // The name of the model. 
    // This field works the same as the `title` field in the 
    // aforementioned /tts/list request.
    "title": "Mario*",

    // The text that was used to generate the audio.
    "raw_inference_text": "This is a use of the voice",

    // When the TTS request was made.
    "created_at": "2022-02-28T05:39:36Z",

    // When the job status was last updated.
    "updated_at": "2022-02-28T05:39:36Z"
  }
}
