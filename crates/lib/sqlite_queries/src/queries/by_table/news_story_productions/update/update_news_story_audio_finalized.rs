use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;

pub struct Args <'a> {
  pub news_story_token: &'a NewsStoryToken,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn update_news_story_audio_finalized(args: Args<'_>) -> AnyhowResult<()> {
  let mut overall_production_status = AwaitableJobStatus::Done.to_str(); // TODO: Changes if we include imagery.
  let mut audio_generation_status = AwaitableJobStatus::Done.to_str();

  let query = sqlx::query!(
        r#"
UPDATE news_story_productions
SET
  overall_production_status = ?,
  audio_generation_status = ?,
  version = version + 1
WHERE
  news_story_token = ?
        "#,
        overall_production_status,
        audio_generation_status,
        args.news_story_token,
    );

  let query_result = query.execute(args.sqlite_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => Err(anyhow!("error updating: {:?}", err)),
  }
}

