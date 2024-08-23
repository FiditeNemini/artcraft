-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

 ALTER TABLE generic_inference_jobs
 ADD INDEX index_generic_inference_jobs_created_at (created_at),
 ALGORITHM=INPLACE, LOCK=NONE;
