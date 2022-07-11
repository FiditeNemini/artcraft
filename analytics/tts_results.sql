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

