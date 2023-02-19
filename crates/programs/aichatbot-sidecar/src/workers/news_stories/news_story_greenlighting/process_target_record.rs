use crate::shared_state::job_state::JobState;
use errors::AnyhowResult;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_production_greenlit_status::{Args, update_news_story_production_greenlit_status};
use std::sync::Arc;
use log::info;
use enums::common::sqlite::web_content_type::WebContentType;
use crate::workers::news_stories::news_story_greenlighting::site_handlers::cnn_greenlighting::cnn_greenlighting;

pub async fn process_target_record(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  // TODO: Decide which articles to skip with heuristics (and soon AI)!

  let maybe_skip_reason = match target.web_content_type {
    WebContentType::CnnArticle => cnn_greenlighting(target),
    _ => None,
  };

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


