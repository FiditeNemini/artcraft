use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::news_story_greenlighting::process_target_record::process_target_record;
use log::{debug, error, info};
use sqlite_queries::queries::by_table::news_story_productions::list::list_news_story_productions_awaiting_greenlight::list_news_story_productions_awaiting_greenlight;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

/// Decide which potential news stories to greenlight
pub async fn news_story_greenlighting_main_loop(job_state: Arc<JobState>) {
  loop {
    debug!("news_story_greenlighting main loop iteration start");

    query_and_process_all_batches(&job_state).await;

    debug!("news_story_greenlighting loop finished; waiting...");
    thread::sleep(Duration::from_secs(5));
  }
}

async fn query_and_process_all_batches(job_state: &Arc<JobState>) {
  const BATCH_SIZE : i64 = 10;

  let mut last_id = 0;
  let mut failure_count = 0;

  loop {
    // NB: Protect sqlite from contention.
    thread::sleep(Duration::from_millis(500));

    debug!("news_story_greenlighting querying targets from id > {} ...", last_id);

    let query_result = list_news_story_productions_awaiting_greenlight(
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
      debug!("process greenlighting for {}", target.news_story_token);
      let result = process_target_record(&target, job_state).await;

      if let Err(err) = result {
        error!("Error processing target: {:?}", err);
      }

      last_id = target.id;
      thread::sleep(Duration::from_secs(1));
    }
  }
}
