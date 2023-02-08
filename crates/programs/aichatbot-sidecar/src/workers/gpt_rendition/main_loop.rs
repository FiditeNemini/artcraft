use crate::shared_state::job_state::JobState;
use crate::workers::gpt_rendition::process_single_item::process_single_item;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use log::{error, info};
use sqlite_queries::queries::by_table::web_rendition_targets::list_web_rendition_targets::list_web_rendition_targets;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

/// Project scraped, etc. content into the desired shape  with GPT.
pub async fn gpt_rendition_main_loop(job_state: Arc<JobState>) {
  loop {
    info!("gpt_rendition main loop");

    single_job_loop_iteration(&job_state).await;

    info!("gpt_rendition loop finished; waiting...");
    thread::sleep(Duration::from_secs(60));
  }
}

// NB: No failures at this level, because we don't want to prevent progress on a stuck feed.
async fn single_job_loop_iteration(job_state: &Arc<JobState>) {
  let statuses = vec![RenditionStatus::New, RenditionStatus::Failed];
  for status in statuses {
    rendition_jobs_of_status(status, job_state).await;
  }
}

async fn rendition_jobs_of_status(status: RenditionStatus, job_state: &Arc<JobState>) {
  const BATCH_SIZE : i64 = 10;

  let mut last_id = 0;
  let mut failure_count = 0;

  loop {
    // NB: Protect sqlite from contention.
    thread::sleep(Duration::from_millis(500));

    info!("web_rendition querying {:?} targets from id > {} ...", &status, last_id);

    let query_result = list_web_rendition_targets(
      status, last_id, BATCH_SIZE, &job_state.sqlite_pool).await;

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
      info!("Rendition for target: {:?}", target.canonical_url);

      let result = process_single_item(&target, job_state).await;
      if let Err(err) = result {
        error!("Error processing target: {:?}", err);
      }

      last_id = target.id;

      thread::sleep(Duration::from_secs(5));
    }
  }
}
