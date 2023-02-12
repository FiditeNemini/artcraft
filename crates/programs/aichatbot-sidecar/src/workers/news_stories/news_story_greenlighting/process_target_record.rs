use crate::shared_state::job_state::JobState;
use errors::AnyhowResult;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_production_greenlit_status::{Args, update_news_story_production_greenlit_status};
use std::sync::Arc;
use log::info;

pub async fn process_target_record(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  // TODO: Decide which articles to skip with heuristics (and soon AI)!
  const IS_GREENLIT : bool = true;

  info!("news story {} greenlit: {}", &target.news_story_token, IS_GREENLIT);

  update_news_story_production_greenlit_status(Args {
    news_story_token: &target.news_story_token,
    is_greenlit: IS_GREENLIT,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}


