-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

ALTER TABLE tts_models
ADD COLUMN maybe_default_pretrained_vocoder VARCHAR(64) DEFAULT NULL
AFTER text_preprocessing_algorithm;

ALTER TABLE tts_inference_jobs
ADD COLUMN maybe_override_pretrained_vocoder VARCHAR(64) DEFAULT NULL
AFTER model_token;

ALTER TABLE tts_results
ADD COLUMN maybe_pretrained_vocoder_used VARCHAR(64) DEFAULT NULL
AFTER model_token;
