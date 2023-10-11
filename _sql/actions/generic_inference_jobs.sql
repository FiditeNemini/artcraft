-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Kill routed jobs
update generic_inference_jobs set status = 'dead' where maybe_routing_tag IS NOT NULL limit 100;

-- Get pending jobs
select count(*) from generic_inference_jobs where status = 'pending';

update generic_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed');

update generic_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed')
and maybe_model_type IN ('sad_talker');
