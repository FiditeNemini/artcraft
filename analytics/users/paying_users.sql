-- noinspection SqlDialectInspectionForFile
-- noinspection SqlNoDataSourceInspectionForFile
-- noinspection SqlResolveForFile


-- Number of paid users (inaccurate)
select count(*) from users where maybe_stripe_customer_id IS NOT NULL;

-- Number of paid users (inaccurate)
select count(*) from user_subscriptions;

-- Number of paid users
-- NB: "active" status users are current, treating "past_due" as active too (for now)
select count(*) from user_subscriptions where maybe_stripe_subscription_status NOT IN ("canceled", "incomplete", "incomplete_expired");

-- All paid subscribers generating results in the last week
select u.username, count(*) as use_count
from users as u
join tts_inference_jobs as j
on u.token = j.maybe_creator_user_token
WHERE u.token IN (
    select distinct user_token
    from user_subscriptions
    where maybe_stripe_subscription_status NOT IN ("canceled", "incomplete", "incomplete_expired")
)
AND j.created_at > NOW() - interval 7 day
GROUP BY u.username
ORDER BY use_count desc

-- Paid subscribers generating results in the last month (with # threshold)
select username, use_count
FROM (
    select u.username, count(*) as use_count
    from users as u
             join tts_inference_jobs as j
                  on u.token = j.maybe_creator_user_token
    WHERE u.token IN (
        select distinct user_token
        from user_subscriptions
        where maybe_stripe_subscription_status NOT IN ("canceled", "incomplete", "incomplete_expired")
    )
    AND j.created_at > NOW() - interval 31 day
    GROUP BY u.username
    ORDER BY use_count desc
) as t
WHERE use_count > 10

-- Paid users gennerating results in the last month
select u.username, count(*) as use_count
from users as u
      join tts_inference_jobs as j
           on u.token = j.maybe_creator_user_token
WHERE u.token IN (
     select distinct user_token
     from user_subscriptions
     where maybe_stripe_subscription_status NOT IN ("canceled", "incomplete", "incomplete_expired")
)
AND j.created_at > NOW() - interval 1 day
GROUP BY u.username
ORDER BY use_count desc



-- Number of paid users who created a result in the last 7 days
select u.created_at from users as u
where u.token IN
      (select distinct u.token from tts_inference_jobs as j join users u on u.token = j.maybe_creator_user_token where j.created_at > now() - interval 7 day)
order by u.created_at ASC;
