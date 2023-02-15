use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::news_story_post_production_finalization::process_single_item::process_single_item;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use log::{debug, error, info};
use sqlite_queries::queries::by_table::news_story_productions::list::list_news_story_productions_awaiting_audio_final_verification::list_news_story_productions_awaiting_audio_final_verification;
use sqlite_queries::queries::by_table::news_story_productions::list::list_news_story_productions_awaiting_llm_rendition::list_news_story_productions_awaiting_llm_rendition;
use sqlite_queries::queries::by_table::news_story_productions::list::list_news_story_productions_ready_for_debut::list_news_story_productions_ready_for_debut;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

/// Find in-production stories with all tasks done, then promote them to stories
pub async fn news_story_post_production_finalization_main_loop(job_state: Arc<JobState>) {
  loop {
    debug!("news_story_post_production main loop");

    query_all_batches(&job_state).await;

    debug!("news_story_post_production loop finished; waiting...");
    thread::sleep(Duration::from_secs(1));
  }
}

async fn query_all_batches(job_state: &Arc<JobState>) {
  const BATCH_SIZE : i64 = 10;

  let mut last_id = 0;
  let mut failure_count = 0;

  loop {
    // NB: Protect sqlite from contention.
    thread::sleep(Duration::from_millis(500));

    debug!("news_story_post_production querying targets from id > {} ...", last_id);

    let query_result = list_news_story_productions_ready_for_debut(
      last_id, BATCH_SIZE, &job_state.sqlite_pool).await;

    let targets = match query_result {
      Ok(targets) => targets,
      Err(err) => {
        error!("failure querying batch: {:?}", err);

        failure_count += 1;

        // NB: Don't starve progress.
        if failure_count > 2 {
          failure_count = 0;
          last_id += 1;
        } else if failure_count > 3 {
          return;
        }

        continue;
      }
    };

    failure_count = 0;

    if targets.is_empty() {
      return; // Done with batches.
    }

    for target in targets {
      debug!("Final post production for target: {:?}", target.original_news_canonical_url);

      let result = process_single_item(&target, job_state).await;
      if let Err(err) = result {
        error!("Error processing target: {:?}", err);
      }

      last_id = target.id;

      thread::sleep(Duration::from_millis(200));
    }
  }
}
