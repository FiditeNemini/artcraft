use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;

pub struct WebRenditionTarget {
  pub id: i64,
  pub canonical_url: String,
  pub web_content_type: WebContentType,
  pub rendition_status: RenditionStatus,
  pub rendition_attempts: i64,
}

pub async fn list_web_rendition_targets(
  rendition_status: RenditionStatus,
  last_id: i64,
  limit: i64,
  sqlite_pool: &SqlitePool,
) -> AnyhowResult<Vec<WebRenditionTarget>> {

  // NB: Sqlx doesn't support `WHERE ... IN (...)` "yet". :(
  // https://github.com/launchbadge/sqlx/blob/6d0d7402c8a9cbea2676a1795e9fb50b0cf60c03/FAQ.md?plain=1#L73
  let rendition_status = rendition_status.to_str().to_string();

  let query = sqlx::query_as!(
    RawInternalWebRenditionTarget,
        r#"
SELECT
  id,
  canonical_url,
  web_content_type as `web_content_type: enums::by_table::web_scraping_targets::web_content_type::WebContentType`,
  rendition_status as `rendition_status: enums::by_table::web_rendition_targets::rendition_status::RenditionStatus`,
  rendition_attempts
FROM web_rendition_targets
WHERE
  rendition_status = ?
  AND maybe_skip_reason IS NULL
  AND id > ?
ORDER BY id ASC
LIMIT ?
        "#,
        rendition_status,
        last_id,
        limit,
    );

  let records = query.fetch_all(sqlite_pool)
      .await?;

  let records = records.into_iter()
      .map(|record : RawInternalWebRenditionTarget| {
        WebRenditionTarget {
          id: record.id,
          canonical_url: record.canonical_url,
          web_content_type: record.web_content_type,
          rendition_status: record.rendition_status,
          rendition_attempts: record.rendition_attempts,
        }
      })
      .collect::<Vec<WebRenditionTarget>>();

  Ok(records)
}

struct RawInternalWebRenditionTarget {
  id: i64,
  canonical_url: String,
  web_content_type: WebContentType,
  rendition_status: RenditionStatus,
  rendition_attempts: i64,
}
