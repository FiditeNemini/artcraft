use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use errors::{anyhow, AnyhowResult};
use sqlx::SqlitePool;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use enums::common::sqlite::chatbot_job_status::ChatbotJobStatus;
use tokens::tokens::news_stories::NewsStoryToken;

pub struct Args <'a> {
  pub news_story_token: &'a NewsStoryToken,

  pub news_story_production_status: ChatbotJobStatus,

  pub sqlite_pool: &'a SqlitePool,
}

pub async fn update_news_story_preproductions(args: Args<'_>) -> AnyhowResult<()> {
  let news_story_production_status= args.news_story_production_status.to_str().to_string();
  let query = sqlx::query!(
        r#"
UPDATE news_story_preproductions
SET
  news_story_production_status = ?,
  version = version + 1
WHERE
  news_story_token = ?
        "#,
        news_story_production_status,
        args.news_story_token,
    );

  let query_result = query.execute(args.sqlite_pool)
      .await;

  match query_result {
    Ok(_) => Ok(()),
    Err(err) => Err(anyhow!("error updating: {:?}", err)),
  }
}
