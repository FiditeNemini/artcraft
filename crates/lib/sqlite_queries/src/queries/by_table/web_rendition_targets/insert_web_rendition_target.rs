use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;

pub struct Args <'a> {
  pub canonical_url: &'a str,

  pub web_content_type: WebContentType,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn insert_web_rendition_target(args: Args<'_>) -> AnyhowResult<()> {
  let web_content_type = args.web_content_type.to_str().to_string();
  let query = sqlx::query!(
        r#"
INSERT INTO web_rendition_targets(
  canonical_url,
  web_content_type
)
VALUES (
  ?,
  ?
)
        "#,
        args.canonical_url,
        web_content_type,
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
