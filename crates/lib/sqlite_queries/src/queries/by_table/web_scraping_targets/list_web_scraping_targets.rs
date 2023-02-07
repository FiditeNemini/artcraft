use enums::by_table::web_scraping_targets::scraping_status::ScrapingStatus;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;

pub struct WebScrapingTarget {
  pub canonical_url: String,
  pub web_content_type: WebContentType,
  pub maybe_title: Option<String>,
  pub maybe_article_full_image_url: Option<String>,
  pub maybe_article_thumbnail_image_url: Option<String>,
  pub scraping_status: ScrapingStatus,
  pub scrape_attempts: i64,
}

pub async fn insert_web_scraping_target(
  scraping_status: ScrapingStatus,
  limit: i64,
  sqlite_pool: &SqlitePool,
) -> AnyhowResult<Vec<WebScrapingTarget>> {

  let scraping_status = scraping_status.to_str().to_string();

  let query = sqlx::query_as!(
    RawInternalWebScrapingTarget,
        r#"
SELECT
  canonical_url,
  web_content_type as `web_content_type: enums::by_table::web_scraping_targets::web_content_type::WebContentType`,
  maybe_title,
  maybe_article_full_image_url,
  maybe_article_thumbnail_image_url,
  scraping_status as `scraping_status: enums::by_table::web_scraping_targets::scraping_status::ScrapingStatus`,
  scrape_attempts
FROM web_scraping_targets
WHERE
  scraping_status = ?
ORDER BY id DESC
LIMIT ?
        "#,
        scraping_status,
        limit,
    );

  let records = query.fetch_all(sqlite_pool)
      .await?;


  let records = records.into_iter()
      .map(|record : RawInternalWebScrapingTarget| {
        WebScrapingTarget {
          canonical_url: record.canonical_url,
          web_content_type: record.web_content_type,
          maybe_title: record.maybe_title,
          maybe_article_full_image_url: record.maybe_article_full_image_url,
          maybe_article_thumbnail_image_url: record.maybe_article_thumbnail_image_url,
          scraping_status: record.scraping_status,
          scrape_attempts: record.scrape_attempts,
        }
      })
      .collect::<Vec<WebScrapingTarget>>();

  Ok(records)
}

struct RawInternalWebScrapingTarget {
  canonical_url: String,
  web_content_type: WebContentType,
  maybe_title: Option<String>,
  maybe_article_full_image_url: Option<String>,
  maybe_article_thumbnail_image_url: Option<String>,
  scraping_status: ScrapingStatus,
  scrape_attempts: i64,
}
