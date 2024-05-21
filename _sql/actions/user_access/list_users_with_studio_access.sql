-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- Find users with studio flags.
select username from users where maybe_feature_flags  like '%studio%';

select username from users where can_access_studio = true;
