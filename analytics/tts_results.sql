-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

--
-- Usage count in the past 24 hours
--
select count(*) as use_count
from tts_results
where created_at > ( CURDATE() - INTERVAL 1 DAY )

--
-- Usage count in the past week
--
select count(*) as use_count
from tts_results
where created_at > ( CURDATE() - INTERVAL 7 DAY )

-- On-prem worker mix
select count(*) as use_count
from tts_results
where created_at > ( CURDATE() - INTERVAL 1 MINUTE )
and is_generated_on_prem IS TRUE

-- Calculate a percentage of on-prem worker capacity
select count(*) as on_prem_count
from (
  select is_generated_on_prem
  from tts_results
  order by id desc limit 1000
) as sample
where sample.is_generated_on_prem IS TRUE;

