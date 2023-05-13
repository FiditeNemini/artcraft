-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Kill routed jobs
update generic_inference_jobs
set status = 'dead' where maybe_routing_tag IS NOT NULL
limit 100;
