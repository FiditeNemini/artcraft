-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

ALTER TABLE media_files
  ADD COLUMN maybe_upstream_media_file_type VARCHAR(32) DEFAULT NULL
  AFTER maybe_cover_image_media_file_token;

ALTER TABLE media_files
  ADD COLUMN maybe_upstream_media_file_token VARCHAR(32) DEFAULT NULL
  AFTER maybe_upstream_media_file_type;
