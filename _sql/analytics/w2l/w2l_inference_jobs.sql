-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Pending job count
select count(*) from w2l_inference_jobs where status='pending';

