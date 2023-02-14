use enums::by_table::tts_render_targets::tts_render_status::TtsRenderStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_render_tasks::TtsRenderTaskToken;

pub struct TtsRenderTarget {
  pub id: i64,
  pub token: TtsRenderTaskToken,

  // Composite foreign key
  pub story_type: String,
  pub story_token: String,

  pub sequence_order: i64,

  pub tts_service: String,
  pub tts_voice_identifier: String,

  pub full_text: String,

  // Token for in-progress render jobs.
  pub maybe_inference_job_token: Option<String>,

  // Results for finished jobs
  pub maybe_result_token: Option<String>,
  pub maybe_result_url: Option<String>,
  pub maybe_result_relative_filesystem_location: Option<String>,

  pub tts_render_status: TtsRenderStatus,
  pub tts_render_attempts: i64,
}

pub async fn list_tts_render_targets(
  tts_render_status: TtsRenderStatus,
  last_id: i64,
  limit: i64,
  sqlite_pool: &SqlitePool,
) -> AnyhowResult<Vec<TtsRenderTarget>> {

  // NB: Sqlx doesn't support `WHERE ... IN (...)` "yet". :(
  // https://github.com/launchbadge/sqlx/blob/6d0d7402c8a9cbea2676a1795e9fb50b0cf60c03/FAQ.md?plain=1#L73
  let tts_render_status = tts_render_status.to_str().to_string();

  let query = sqlx::query_as!(
    RawInternalTtsRenderTarget,
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
  tts_render_status = ?
  AND id > ?
ORDER BY id ASC
LIMIT ?
        "#,
        tts_render_status,
        last_id,
        limit,
    );

  let records = query.fetch_all(sqlite_pool)
      .await?;

  let records = records.into_iter()
      .map(|record : RawInternalTtsRenderTarget| {
        TtsRenderTarget {
          id: record.id,
          token: record.token,
          story_type: record.story_type,
          story_token: record.story_token,
          sequence_order: record.sequence_order,
          tts_service: record.tts_service,
          tts_voice_identifier: record.tts_voice_identifier,
          full_text: record.full_text,
          maybe_inference_job_token: record.maybe_inference_job_token,
          maybe_result_token: record.maybe_result_token,
          maybe_result_url: record.maybe_result_url,
          maybe_result_relative_filesystem_location: record.maybe_result_relative_filesystem_location,
          tts_render_status: record.tts_render_status,
          tts_render_attempts: record.tts_render_attempts,
        }
      })
      .collect::<Vec<TtsRenderTarget>>();

  Ok(records)
}

struct RawInternalTtsRenderTarget {
  pub id: i64,
  pub token: TtsRenderTaskToken,

  // Composite foreign key
  pub story_type: String,
  pub story_token: String,

  pub sequence_order: i64,

  pub tts_service: String,
  pub tts_voice_identifier: String,

  pub full_text: String,

  // Token for in-progress render jobs.
  pub maybe_inference_job_token: Option<String>,

  // Results for finished jobs
  pub maybe_result_token: Option<String>,
  pub maybe_result_url: Option<String>,
  pub maybe_result_relative_filesystem_location: Option<String>,

  pub tts_render_status: TtsRenderStatus,
  pub tts_render_attempts: i64,
}
