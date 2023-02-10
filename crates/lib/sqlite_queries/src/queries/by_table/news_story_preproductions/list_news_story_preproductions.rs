use enums::common::sqlite::chatbot_job_status::ChatbotJobStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;
use tokens::tokens::tts_models::TtsModelToken;

pub struct NewsStoryPreproduction {
  id: i64,
  news_story_token: NewsStoryToken,
  original_news_canonical_url: String,
  tts_service: String,
  tts_voice_identifier: TtsModelToken,
  full_text: String,
  maybe_result_url: Option<String>,
  maybe_filesystem_relative_location: Option<String>,
  news_story_production_status: ChatbotJobStatus,
}

pub async fn list_news_story_preproductions(
  job_status: ChatbotJobStatus,
  last_id: i64,
  limit: i64,
  sqlite_pool: &SqlitePool,
) -> AnyhowResult<Vec<NewsStoryPreproduction>> {

  // NB: Sqlx doesn't support `WHERE ... IN (...)` "yet". :(
  // https://github.com/launchbadge/sqlx/blob/6d0d7402c8a9cbea2676a1795e9fb50b0cf60c03/FAQ.md?plain=1#L73
  let job_status = job_status.to_str().to_string();

  let query = sqlx::query_as!(
    RawInternalNewsStoryPreproduction,
        r#"
SELECT
  id,
  news_story_token as `news_story_token: tokens::tokens::news_stories::NewsStoryToken`,
  original_news_canonical_url,
  tts_service,
  tts_voice_identifier as `tts_voice_identifier: tokens::tokens::tts_models::TtsModelToken`,
  full_text,
  maybe_result_url,
  maybe_filesystem_relative_location,
  news_story_production_status as `news_story_production_status: enums::common::sqlite::chatbot_job_status::ChatbotJobStatus`
FROM news_story_preproductions
WHERE
  news_story_production_status = ?
  AND id > ?
ORDER BY id ASC
LIMIT ?
        "#,
        job_status,
        last_id,
        limit,
    );

  let records = query.fetch_all(sqlite_pool)
      .await?;

  let records = records.into_iter()
      .map(|record : RawInternalNewsStoryPreproduction| {
        NewsStoryPreproduction {
          id: record.id,
          news_story_token: record.news_story_token,
          original_news_canonical_url: record.original_news_canonical_url,
          tts_service: record.tts_service,
          tts_voice_identifier: record.tts_voice_identifier,
          full_text: record.full_text,
          maybe_result_url: record.maybe_result_url,
          maybe_filesystem_relative_location: record.maybe_filesystem_relative_location,
          news_story_production_status: record.news_story_production_status,
        }
      })
      .collect::<Vec<NewsStoryPreproduction>>();

  Ok(records)
}

struct RawInternalNewsStoryPreproduction {
  id: i64,
  news_story_token: NewsStoryToken,
  original_news_canonical_url: String,
  tts_service: String,
  tts_voice_identifier: TtsModelToken,
  full_text: String,
  maybe_result_url: Option<String>,
  maybe_filesystem_relative_location: Option<String>,
  news_story_production_status: ChatbotJobStatus,
}
