use crate::shared_state::job_state::JobState;
use enums::by_table::tts_render_tasks::tts_render_status::TtsRenderStatus;
use errors::AnyhowResult;
use log::{debug, info};
use once_cell::sync::Lazy;
use regex::Regex;
use sqlite_queries::queries::by_table::news_story_productions::list::news_story_production_item::NewsStoryProductionItem;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_audio_finalized_failure::update_news_story_audio_finalized_failure;
use sqlite_queries::queries::by_table::news_story_productions::update::update_news_story_audio_finalized_success::update_news_story_audio_finalized_success;
use sqlite_queries::queries::by_table::tts_render_tasks::list::list_tts_render_tasks_for_story_token::list_tts_render_tasks_for_story_token;
use std::sync::Arc;

pub async fn process_single_item(target: &NewsStoryProductionItem, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  let story_type = "news_story";
  let story_token = target.news_story_token.to_string();

  let tts_render_tasks = list_tts_render_tasks_for_story_token(
    story_type,
    &story_token,
    &job_state.sqlite_pool).await?;

  let complete_count = tts_render_tasks.iter()
      .filter(|target| target.tts_render_status == TtsRenderStatus::Success)
      .count();

  // TODO: Include new column "tts_render_tasks.sequence_length" to verify. Math.max() it.
  //  This is to prevent a race condition.
  let total_count = tts_render_tasks.len();

  if complete_count != total_count {
    // NB: We're still waiting on the TTS tasks to complete. Keep waiting.
    debug!("Audio not yet rendered for story: {:?}", target.news_story_token);
    return Ok(())
  }

  for tts_render_task in tts_render_tasks.iter() {
    match tts_render_task.maybe_audio_duration_millis {
      None => {
        // TODO: This might be an error given the above ^
        debug!("Audio not yet rendered for story: {:?}", target.news_story_token);
        return Ok(())
      }
      Some(millis) => {
        if millis > 100000 {
          // NB: > 1.666 minutes, which is likely a TTS stroke

          update_news_story_audio_finalized_failure(
            &target.news_story_token,
            &job_state.sqlite_pool,
          ).await?;

          return Ok(())
        }
      }
    }
  }

  update_news_story_audio_finalized_success(
    &target.news_story_token,
    &job_state.sqlite_pool,
  ).await?;

  Ok(())
}
