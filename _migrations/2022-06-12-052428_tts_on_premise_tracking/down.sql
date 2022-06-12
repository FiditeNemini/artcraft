-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

ALTER TABLE tts_results
    DROP COLUMN is_generated_on_premise;

ALTER TABLE tts_results
    DROP COLUMN generated_by_worker;
