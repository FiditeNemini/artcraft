use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use enums::common::sqlite::skip_reason::SkipReason;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;
use tokens::tokens::tts_models::TtsModelToken;

pub struct Args <'a> {
  pub canonical_url: &'a str,

  pub news_story_token: &'a NewsStoryToken,

  pub original_news_canonical_url: &'a str,

  pub tts_voice_identifier: &'a TtsModelToken,

  pub full_text: &'a str,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn insert_news_story_preproductions(args: Args<'_>) -> AnyhowResult<()> {
  let news_story_token = args.news_story_token.as_str();
  let tts_model_token = args.tts_voice_identifier.as_str();

  let query = sqlx::query!(
        r#"
INSERT INTO news_story_preproductions (
  news_story_token,
  original_news_canonical_url,
  tts_service,
  tts_voice_identifier,
  full_text
)
VALUES (
  ?,
  ?,
  "fakeyou",
  ?,
  ?
)
        "#,
        news_story_token,
        args.original_news_canonical_url,
        tts_model_token,
        args.full_text
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
