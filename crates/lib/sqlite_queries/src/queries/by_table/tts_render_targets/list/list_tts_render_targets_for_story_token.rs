use crate::queries::by_table::tts_render_targets::list::tts_render_target::TtsRenderTarget;
use enums::by_table::tts_render_targets::tts_render_status::TtsRenderStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_render_tasks::TtsRenderTaskToken;

// TODO: need to move download status to a different column as it's a different job

pub async fn list_tts_render_targets_for_story_token(
  story_type: &str,
  story_token: &str,
  sqlite_pool: &SqlitePool,
) -> AnyhowResult<Vec<TtsRenderTarget>> {

  let query = sqlx::query_as!(
    TtsRenderTarget,
        r#"
SELECT
  id,
  token as `token: tokens::tokens::tts_render_tasks::TtsRenderTaskToken`,
  story_type,
  story_token,
  sequence_order,
  tts_service,
  tts_voice_identifier,
  full_text,
  maybe_inference_job_token,
  maybe_result_token,
  maybe_result_url,
  maybe_result_relative_filesystem_location,
  tts_render_status as `tts_render_status: enums::by_table::tts_render_targets::tts_render_status::TtsRenderStatus`,
  tts_render_attempts
FROM tts_render_targets
WHERE
  story_type = ?
  AND story_token = ?
ORDER BY sequence_order ASC
        "#,
        story_type,
        story_token,
    );

  let records = query.fetch_all(sqlite_pool)
      .await?;

  Ok(records)
}
