use crate::shared_state::job_state::JobState;
use crate::workers::news_stories::news_story_llm_rendition::process_single_item::process_single_item;
use enums::by_table::web_rendition_targets::rendition_status::RenditionStatus;
use enums::common::sqlite::awaitable_job_status::AwaitableJobStatus;
use log::{debug, error, info};
use sqlite_queries::queries::by_table::news_story_productions::list::list_news_story_productions_awaiting_llm_rendition::list_news_story_productions_awaiting_llm_rendition;
use sqlite_queries::queries::by_table::web_rendition_targets::list_web_rendition_targets::list_web_rendition_targets;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

/// Project scraped, etc. content into the desired shape  with GPT.
pub async fn news_story_llm_rendition_main_loop(job_state: Arc<JobState>) {
  loop {
    debug!("news_story_llm_rendition_main_loop main loop");

    single_job_loop_iteration(&job_state).await;

    debug!("gpt_rendition loop finished; waiting...");
    thread::sleep(Duration::from_secs(1));
  }
}

// NB: No failures at this level, because we don't want to prevent progress on a stuck feed.
async fn single_job_loop_iteration(job_state: &Arc<JobState>) {
  let statuses = vec![AwaitableJobStatus::ReadyWaiting, AwaitableJobStatus::RetryablyFailed];
  for status in statuses {
    rendition_jobs_of_status(status, job_state).await;
  }
}

async fn rendition_jobs_of_status(status: AwaitableJobStatus, job_state: &Arc<JobState>) {
  const BATCH_SIZE : i64 = 10;

  let mut last_id = 0;
  let mut failure_count = 0;

  loop {
    // NB: Protect sqlite from contention.
    thread::sleep(Duration::from_millis(500));

    debug!("web_rendition querying {:?} targets from id > {} ...", &status, last_id);

    let query_result = list_news_story_productions_awaiting_llm_rendition(
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
      debug!("Rendition for target: {:?}", target.original_news_canonical_url);

      let result = process_single_item(&target, job_state).await;
      if let Err(err) = result {
        error!("Error processing target: {:?}", err);
      }

      last_id = target.id;

      thread::sleep(Duration::from_secs(5)); // NB: We probably (?) need to throttle API calls to OpenAI
    }
  }
}
