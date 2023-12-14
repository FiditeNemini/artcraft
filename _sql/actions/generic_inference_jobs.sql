-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Kill routed jobs
update generic_inference_jobs set status = 'dead' where maybe_routing_tag IS NOT NULL limit 100;

-- Get pending jobs
select count(*) from generic_inference_jobs where status = 'pending';

-- Kill outstanding jobs
update generic_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed');

-- Kill outstanding jobs of type
update generic_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed')
and maybe_model_type IN ('sad_talker', 'so_vits_svc');

-- Tacotron 2 TTS
update generic_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed')
  and maybe_model_type IN ('tacotron2');

-- Sad Talker Face Animation
update generic_inference_jobs
set status = 'dead'
where status IN ('pending', 'started', 'attempt_failed')
  and maybe_model_type IN ('sad_talker');
