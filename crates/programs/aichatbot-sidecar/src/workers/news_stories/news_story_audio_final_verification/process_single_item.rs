use crate::shared_state::job_state::JobState;
use enums::by_table::tts_render_targets::tts_render_status::TtsRenderStatus;
use errors::AnyhowResult;
use log::{debug, info};
use once_cell::sync::Lazy;
use regex::Regex;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_audio_finalized::{Args, update_news_story_audio_finalized};
use sqlite_queries::queries::by_table::tts_render_targets::list::list_tts_render_targets_for_story_token::list_tts_render_targets_for_story_token;
use std::sync::Arc;

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  let story_type = "news_story";
  let story_token = target.news_story_token.to_string();

  let tts_render_targets = list_tts_render_targets_for_story_token(
    story_type,
    &story_token,
    &job_state.sqlite_pool).await?;

  let complete_count = tts_render_targets.iter()
      .filter(|target| target.tts_render_status == TtsRenderStatus::Success)
      .count();

  // TODO: Include new column "tts_render_targets.sequence_length" to verify. Math.max() it.
  //  This is to prevent a race condition.
  let total_count = tts_render_targets.len();

  if complete_count != total_count {
    debug!("Audio not yet rendered for story: {:?}", target.news_story_token);
    return Ok(())
  }

  update_news_story_audio_finalized(Args {
    news_story_token: &target.news_story_token,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}
