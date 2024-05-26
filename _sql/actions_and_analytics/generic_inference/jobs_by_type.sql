-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Histogram by type
-- NB: no index on ip, hence subquery
select
    job_type,
    inference_category,
    maybe_model_type,
    count(*)
FROM (
        SELECT
            job_type,
            inference_category,
            maybe_model_type
        FROM generic_inference_jobs
        ORDER BY id DESC
        LIMIT 50000
    ) as j
group by job_type, inference_category, maybe_model_type;

-- Histogram by type (still processing)
-- NB: no index on ip, hence subquery
select
    job_type,
    inference_category,
    maybe_model_type,
    count(*)
FROM (
         SELECT
             job_type,
             inference_category,
             maybe_model_type
         FROM generic_inference_jobs
         WHERE status IN ('pending', 'started', 'attempt_failed')
         ORDER BY id DESC
             LIMIT 50000
     ) as j
group by job_type, inference_category, maybe_model_type;