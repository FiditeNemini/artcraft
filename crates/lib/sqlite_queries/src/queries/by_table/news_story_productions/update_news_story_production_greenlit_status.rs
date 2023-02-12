use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;

pub struct Args <'a> {
  pub news_story_token: &'a NewsStoryToken,

  pub is_greenlit: bool,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn update_news_story_production_greenlit_status(args: Args<'_>) -> AnyhowResult<()> {
  // NB: "audio_generation_status" etc. should still be "not_ready".
  let mut overall_production_status;
  let mut llm_rendition_status;

  if args.is_greenlit {
    overall_production_status = AwaitableJobStatus::Processing.to_str();
    llm_rendition_status = AwaitableJobStatus::ReadyWaiting.to_str();
  } else {
    overall_production_status = AwaitableJobStatus::Skipped.to_str();
    llm_rendition_status = AwaitableJobStatus::Skipped.to_str();
  }

  let query = sqlx::query!(
        r#"
UPDATE news_story_productions
SET
  overall_production_status = ?,
  llm_rendition_status = ?,
  version = version + 1
WHERE
  news_story_token = ?
        "#,
        overall_production_status,
        llm_rendition_status,
        args.news_story_token,
    );

  let query_result = query.execute(args.sqlite_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => Err(anyhow!("error updating: {:?}", err)),
  }
}
