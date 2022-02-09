-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

ALTER TABLE tts_inference_jobs
  ADD COLUMN is_from_api BOOLEAN NOT NULL DEFAULT FALSE
  AFTER creator_set_visibility,
  ADD COLUMN is_for_twitch BOOLEAN NOT NULL DEFAULT FALSE
  AFTER is_from_api;

ALTER TABLE tts_results
  ADD COLUMN is_from_api BOOLEAN NOT NULL DEFAULT FALSE
  AFTER duration_millis,
  ADD COLUMN is_for_twitch BOOLEAN NOT NULL DEFAULT FALSE
  AFTER is_from_api;
