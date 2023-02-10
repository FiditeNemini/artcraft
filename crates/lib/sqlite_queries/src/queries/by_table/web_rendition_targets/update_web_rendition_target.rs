use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;

pub struct Args <'a> {
  pub canonical_url: &'a str,

  pub rendition_status: RenditionStatus,
  pub rendition_attempts: i64,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn update_web_rendition_target(args: Args<'_>) -> AnyhowResult<()> {
  let rendition_status = args.rendition_status.to_str().to_string();
  let query = sqlx::query!(
        r#"
UPDATE web_rendition_targets
SET
  rendition_status = ?,
  rendition_attempts = ?,
  version = version + 1
WHERE
  canonical_url = ?
        "#,
        rendition_status,
        args.rendition_attempts,
        args.canonical_url,
    );

  let query_result = query.execute(args.sqlite_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => Err(anyhow!("error updating: {:?}", err)),
  }
}
