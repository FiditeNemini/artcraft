-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- All users
select count(*) from users;

-- Users registered in the last year
select count(*)
from users
where created_at > ( CURDATE() - INTERVAL 365 DAY )
