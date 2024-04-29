-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile

-- NB: no date columns have an index :(
-- last id 30811607
-- id 29011606  2024-04-16 23:49:42
-- 28711606
select count(*)
from generic_inference_jobs
where id > 28711606
--where created_at > (CURDATE() - INTERVAL 1 MINUTE)

select avg(success_execution_millis), inference_category
from generic_inference_jobs
where id > 28711606
and maybe_creator_user_token IS NULL
and status = 'complete_success'
group by inference_category


select avg(success_execution_millis), inference_category, count(*)
from generic_inference_jobs
where id > 28711606
  and maybe_creator_user_token IS NULL
  and status = 'complete_success'
group by inference_category

-- TODO: generations per user
select inference_category, count(*)
from (
    select maybe_creator_anonymous_visitor_token, inference_category, count(*)
    from generic_inference_jobs
    where id > 28711606
    and maybe_creator_user_token IS NULL
    group by inference_category, maybe_creator_anonymous_visitor_token
) as sub
group by sub.inference_category



select avg(success_execution_millis), inference_category, count(*), subscription_product_slug
from generic_inference_jobs
join users
on users.token = generic_inference_jobs.maybe_creator_user_token
left outer join user_subscriptions
on user_subscriptions.user_token = users.token
where generic_inference_jobs.id > 28711606
  and status = 'complete_success'
group by inference_category, user_subscriptions.subscription_product_slug

-- Number of unique users for each
