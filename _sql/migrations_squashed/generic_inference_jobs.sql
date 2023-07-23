-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

CREATE TABLE generic_inference_jobs (

  -- Not used for anything except replication.
  id BIGINT(20) NOT NULL AUTO_INCREMENT,

  -- Effective "primary key" (PUBLIC)
  -- This is so the in-progress results can be looked up by the UI.
  token VARCHAR(32) NOT NULL,

  -- Idempotency token from client
  -- This is so the frontend client doesn't submit duplicate jobs.
  uuid_idempotency_token VARCHAR(36) NOT NULL,

  -- ========== INFERENCE DETAILS ==========

  -- Broad category of inference
  -- Examples (may not be up to date):
  --  * text_to_speech
  --  * voice_conversion
  inference_category VARCHAR(32) NOT NULL,

  -- Potential part of the composite foreign key to the primary model being used, if any.
  -- This will normally live in `maybe_inference_args`, but in this case, it's useful for
  -- running easy database analytical queries.
  --
  -- Examples (may not be up to date):
  --    * rvc_v2
  --    * so_vits_svc
  --    * tacotron2
  --    * vits
  --
  maybe_model_type VARCHAR(32) DEFAULT NULL,

  -- Potential part of the composite foreign key to the primary model being used, if any.
  -- This will normally live in `maybe_inference_args`, but in this case, it's useful for
  -- running easy database analytical queries.
  maybe_model_token VARCHAR(32) DEFAULT NULL,

  -- If the inference job takes some other kind of entity, this will be the token
  -- Not all inference jobs have record-like input sources.
  maybe_input_source_token VARCHAR(32) DEFAULT NULL,

  -- If the inference job takes some other kind of entity, this will be the type of the
  -- token. For now, this is just `media_upload`.
  -- Not all inference jobs have record-like input sources.
  maybe_input_source_token_type VARCHAR(32) DEFAULT NULL,

  -- Polymorphic arguments payload that depends on the type of inference job.
  -- TEXT = 65,535 bytes (64 KiB), ~= 4 bytes per UTF-8 character, ~ 16383 characters.
  maybe_inference_args TEXT DEFAULT NULL,

  -- For text-based workloads, the raw, unprocessed user input.
  -- TEXT = 65,535 bytes (64 KiB), ~= 4 bytes per UTF-8 character, ~ 16383 characters.
  maybe_raw_inference_text TEXT DEFAULT NULL,

  -- ========== SUCCESS CASE ==========

  -- The type of the object will vary based on the type of the upload,
  -- and we may include heuristics that auto-detect types in the future
  on_success_result_entity_type VARCHAR(32) DEFAULT NULL,

  -- If the job completes successfully, this is the result token.
  -- This is only populated on a successful result.
  on_success_result_entity_token VARCHAR(32) DEFAULT NULL,

  -- ========== CREATOR DETAILS AND PREFERENCES ==========

  -- Foreign key to user
  maybe_creator_user_token VARCHAR(32) DEFAULT NULL,

  -- Based on a cookie sent by the frontend.
  -- We'll save this even if the user is logged in.
  maybe_creator_anonymous_visitor_token VARCHAR(32) DEFAULT NULL,

  -- For abuse tracking.
  -- Wide enough for IPv4/6
  creator_ip_address VARCHAR(40) NOT NULL,

  -- The creator can set a desired visibility for their data.
  -- This does not always apply to every upload type.
  -- Additionally, some upload types may require moderator approval prior
  -- to being publicly listed, and this field has no bearing on that.
  -- NB: DO NOT CHANGE THE ORDER OF THE ENUM VALUES DURING SCHEMA MIGRATIONS.
  creator_set_visibility ENUM(
    'public',
    'hidden',
    'private'
  ) NOT NULL DEFAULT 'public',

  -- ========== PREMIUM FEATURES METADATA ==========

  -- The maximum duration for generated audio or video in seconds.
  -- Zero is implied to be the default value, which is typically 12 seconds.
  -- A negative value implies "unlimited".
  max_duration_seconds INTEGER NOT NULL DEFAULT 0,

  -- ========== WORKLOAD SOURCE AND PRIORITY ==========

  -- Priority *increases*, so a level of 2 will be higher than 1.
  -- These are the level semantics currently:
  --   - All jobs from anonymous FakeYou users have level 0.
  --   - All jobs from logged in FakeYou users have level 1.
  --   - All jobs from Twitch TTS (unpaid) have level 10 (ten).
  --   - (There will be future levels for paid Twitch and social FakeYou rewards.)
  priority_level SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  -- For non-premium workloads (or some other workloads), we may require that the
  -- user remains on the website. This will help us kill jobs if the user leaves.
  -- The state for this keepalive signal will be job-type dependent and may live
  -- in Redis or some other system. Typically the frontend job status polling will
  -- populate this keepalive signal (eg. in a Redis key with TTL).
  is_keepalive_required BOOLEAN NOT NULL DEFAULT FALSE,

  -- TODO: add is_for_storyteller_product
  is_from_premium_user BOOLEAN NOT NULL DEFAULT FALSE,
  is_from_api_user BOOLEAN NOT NULL DEFAULT FALSE,
  is_for_twitch BOOLEAN NOT NULL DEFAULT FALSE,

  -- ========== DEVELOPMENT AND DEBUGGING METADATA ==========

  -- If true, the request gets a "debug" flag, which may do different
  -- things depending on the type of work.
  is_debug_request BOOLEAN NOT NULL DEFAULT FALSE,

  -- If set, the request gets processed by a special "tagged" worker
  -- that matches this tag. The ordinary workers will ignore this work.
  maybe_routing_tag VARCHAR(32) DEFAULT NULL,

  -- ========== JOB SYSTEM DETAILS ==========

  -- Jobs begin as "pending", then transition to other states.
  --
  --  * Pending = job is ready to go
  --  * Started = job is running
  --  * Complete_Success = job is done (success)
  --  * Complete_Failure = job is done (failure)
  --  * Attempt_Failed = job failed but may retry.
  --  * Dead = job failed permanently.
  --
  -- Pending -> Started -> Complete_Success
  --                    |-> Complete_Failure
  --                    \-> Attempt_Failed -> Started -> { Complete, Failed, Dead }
  status ENUM(
    'pending',
    'started',
    'complete_success',
    'complete_failure',
    'attempt_failed',
    'dead') NOT NULL DEFAULT 'pending',

  -- We can track this against a "max_attempt_count"
  attempt_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  -- If there is a failure, tell the user why.
  failure_reason VARCHAR(512) DEFAULT NULL,

  -- Optional internal-only debugging information in the case of failure.
  internal_debugging_failure_reason VARCHAR(512) DEFAULT NULL,

  -- On success, we populate how long the job execution took in milliseconds.
  -- We have this because 1) the job system timestamps are second-resolution,
  -- and 2) the structure of the jobs executor may change, potentially changing
  -- derived execution time analytics with it.
  success_execution_millis INT(10) UNSIGNED DEFAULT NULL,

  -- This is only the inference portion and does not include downloads, uploads,
  -- or any subsequent processing.
  success_inference_execution_millis INT(10) UNSIGNED DEFAULT NULL,

  -- TODO: Remove once `assigned_worker` column is added
  --   and existing queries for this column are removed.
  -- The last worker (hostname or pod name) to touch the job, either in the case of success or failure.
  last_assigned_worker VARCHAR(255) DEFAULT NULL,

  -- Worker hostname (linux hostname, k8s pod name)
  -- Assigned when a worker picks up the job
  -- Reassigned if the job fails and gets picked up again
  assigned_worker VARCHAR(128) DEFAULT NULL,

  -- Cluster name (k8s)
  -- Assigned when a worker picks up the job
  -- Reassigned if the job fails and gets picked up again
  assigned_cluster VARCHAR(128) DEFAULT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Failed jobs will set a next attempt time.
  -- Subsequent tries can increase the timeout.
  -- Failures because of permissions require human intervention => [retry_at=null].
  -- Failures because of invalid files are dead => [status=dead].
  retry_at TIMESTAMP NULL,

  -- Set when the job first starts executing
  first_started_at TIMESTAMP NULL,

  -- Set when the job is successfully completed
  successfully_completed_at TIMESTAMP NULL,

  -- INDICES --
  PRIMARY KEY (id),
  UNIQUE KEY (token),
  UNIQUE KEY (uuid_idempotency_token),
  KEY index_inference_category (inference_category),
  KEY index_maybe_model_type_and_maybe_model_token (maybe_model_type, maybe_model_token),
  KEY index_maybe_model_type (maybe_model_type),
  KEY fk_maybe_model_token (maybe_model_token),
  KEY fk_maybe_input_source_token (maybe_input_source_token),
  KEY fk_maybe_input_source_token_and_type (maybe_input_source_token, maybe_input_source_token_type),
  KEY fk_on_success_result_entity_token (on_success_result_entity_token),
  KEY fk_maybe_creator_user_token (maybe_creator_user_token),
  KEY index_creator_ip_address (creator_ip_address),
  KEY index_priority_level (priority_level),
  KEY index_is_debug_request (is_debug_request),
  KEY index_maybe_routing_tag (maybe_routing_tag),
  KEY index_status (status)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
