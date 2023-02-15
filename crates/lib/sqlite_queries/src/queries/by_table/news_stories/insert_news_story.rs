use chrono::{DateTime, Utc};
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;

pub struct Args <'a> {
  pub news_story_token: &'a NewsStoryToken,

  pub original_news_canonical_url: &'a str,

  pub replayable_until: DateTime<Utc>,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn insert_news_story(args: Args<'_>) -> AnyhowResult<()> {
  let news_story_token = args.news_story_token.as_str();

  let query = sqlx::query!(
        r#"
INSERT INTO news_stories (
  news_story_token,
  original_news_canonical_url,
  replayable_until,
  is_playable
)
VALUES (
  ?,
  ?,
  ?,
  true
)
        "#,
        news_story_token,
        args.original_news_canonical_url,
        args.replayable_until
    );

  let query_result = query.execute(args.sqlite_pool)
      .await;

  let _record_id = match query_result {
    Ok(res) => res.last_insert_rowid(),
    Err(err) => {
      return Err(anyhow!("error inserting: {:?}", err));
    }
  };

  Ok(())
}
