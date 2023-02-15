use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_render_tasks::TtsRenderTaskToken;

pub struct Args <'a> {
  // TODO: This will be multiple types in the future
  pub news_story_token: &'a NewsStoryToken,

  pub sequence_order: i64,

  pub tts_voice_identifier: &'a TtsModelToken,

  pub full_text: &'a str,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn insert_tts_render_task(args: Args<'_>) -> AnyhowResult<()> {
  let news_story_token = args.news_story_token.to_string();
  let tts_voice_identifier= args.tts_voice_identifier.to_string();

  let tts_render_task_token = TtsRenderTaskToken::generate().to_string();

  let query = sqlx::query!(
        r#"
INSERT INTO tts_render_tasks(
  token,
  story_type,
  story_token,
  sequence_order,
  tts_service,
  tts_voice_identifier,
  full_text
)
VALUES (
  ?,
  "news_story",
  ?,
  ?,
  "fakeyou",
  ?,
  ?
)
        "#,
        tts_render_task_token,
        news_story_token,
        args.sequence_order,
        tts_voice_identifier,
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