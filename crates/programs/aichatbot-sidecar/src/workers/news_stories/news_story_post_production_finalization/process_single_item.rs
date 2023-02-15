use chrono::Duration;
use chrono::Utc;
use crate::shared_state::job_state::JobState;
use enums::by_table::tts_render_tasks::tts_render_status::TtsRenderStatus;
use errors::AnyhowResult;
use log::{debug, info};
use once_cell::sync::Lazy;
use regex::Regex;
use sqlite_queries::queries::by_table::news_stories::insert_news_story::Args as InsertArgs;
use sqlite_queries::queries::by_table::news_stories::insert_news_story::insert_news_story;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_post_production_complete::Args as UpdateArgs;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_post_production_complete::update_news_story_post_production_complete;
use std::ops::Add;
use std::sync::Arc;

/// Stop playing stories after 24 hours elapses
static STORY_FRESHNESS_THRESHOLD : Lazy<Duration> = Lazy::new(|| {
  Duration::days(1)
});

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  let replayable_until = Utc::now().add(*STORY_FRESHNESS_THRESHOLD);

  insert_news_story(InsertArgs {
    news_story_token: &target.news_story_token,
    original_news_canonical_url: &target.original_news_canonical_url,
    replayable_until,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  update_news_story_post_production_complete(UpdateArgs {
    news_story_token: &target.news_story_token,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}
