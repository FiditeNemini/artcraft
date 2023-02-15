use crate::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use tokens::tokens::news_stories::NewsStoryToken;

pub async fn list_news_story_productions_ready_for_debut(
  last_id: i64,
  limit: i64,
  sqlite_pool: &SqlitePool,
) -> AnyhowResult<Vec<NewsStoryProductionItem>> {

  let query = sqlx::query_as!(
    NewsStoryProductionItem,
        r#"
SELECT
  id,
  news_story_token as `news_story_token: tokens::tokens::news_stories::NewsStoryToken`,
  original_news_canonical_url,
  overall_production_status as `overall_production_status: enums::common::sqlite::awaitable_job_status::AwaitableJobStatus`,
  llm_rendition_status as `llm_rendition_status: enums::common::sqlite::awaitable_job_status::AwaitableJobStatus`,
  llm_rendition_attempts,
  audio_generation_status as `audio_generation_status: enums::common::sqlite::awaitable_job_status::AwaitableJobStatus`
FROM news_story_productions
WHERE
  overall_production_status = "processing"
  AND llm_rendition_status = "done"
  AND audio_generation_status = "done"
  AND id > ?
ORDER BY id ASC
LIMIT ?
        "#,
        last_id,
        limit,
    );

  let records = query.fetch_all(sqlite_pool)
      .await?;

  Ok(records)
}
