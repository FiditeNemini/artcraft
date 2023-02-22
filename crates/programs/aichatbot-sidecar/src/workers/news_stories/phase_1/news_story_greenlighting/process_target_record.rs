use crate::persistence::load_scraped_result::load_scraped_result;
use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::phase_1::news_story_greenlighting::site_handlers::cnn_greenlighting::cnn_greenlighting;
use enums::common::sqlite::skip_reason::SkipReason;
use enums::common::sqlite::web_content_type::WebContentType;
use errors::AnyhowResult;
use log::info;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_production_greenlit_status::{Args, update_news_story_production_greenlit_status};
use std::sync::Arc;

pub async fn process_target_record(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  // TODO: Decide which articles to skip with heuristics (and soon AI)!

  let mut maybe_skip_reason = None;

  {
    let scraping_result = load_scraped_result(
      &target.original_news_canonical_url,
      &job_state.save_directory).await?;

    let body_text = scraping_result.body_text.trim();

    if body_text.is_empty() || body_text.len() < 50 {
      maybe_skip_reason = Some(SkipReason::EmptyContent);
    }
  }

  if maybe_skip_reason.is_none() {
    maybe_skip_reason = match target.web_content_type {
      WebContentType::CnnArticle => cnn_greenlighting(target),
      _ => None,
    };
  }

  let is_greenlit = maybe_skip_reason.is_none();

  info!("news story {} greenlit: {}", &target.news_story_token, is_greenlit);

  update_news_story_production_greenlit_status(Args {
    news_story_token: &target.news_story_token,
    maybe_skip_reason,
    is_greenlit,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}

