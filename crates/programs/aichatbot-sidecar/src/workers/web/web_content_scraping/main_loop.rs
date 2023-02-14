use crate::shared_state::job_state::JobState;
use crate::workers::web::web_content_scraping::single_target::process_target_record::process_target_record;
use enums::by_table::web_scraping_targets::scraping_status::ScrapingStatus;
use errors::AnyhowResult;
use log::{error, info};
use sqlite_queries::queries::by_table::web_scraping_targets::insert_web_scraping_target::{Args, insert_web_scraping_target};
use sqlite_queries::queries::by_table::web_scraping_targets::list_web_scraping_targets::WebScrapingTarget as WebScrapingTargetRecord;
use sqlite_queries::queries::by_table::web_scraping_targets::list_web_scraping_targets::list_web_scraping_targets;
use sqlx::sqlite::SqlitePoolOptions;
use std::future::Future;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use strum::IntoEnumIterator;
use web_scrapers::payloads::web_scraping_result::ScrapedWebArticle;
use web_scrapers::payloads::web_scraping_target::WebScrapingTarget;
use web_scrapers::sites::cnn::cnn_indexer::{cnn_indexer, CnnFeed};
use web_scrapers::sites::techcrunch::techcrunch_indexer::{techcrunch_indexer, TechcrunchFeed};

/// Follow up on articles tagged to be indexed by downloading and scraping their contents.
pub async fn web_content_scraping_main_loop(job_state: Arc<JobState>) {
  loop {
    info!("web_content_scraping main loop");

    while job_state.app_control_state.is_scraping_paused() {
      thread::sleep(Duration::from_secs(5));
    }

    single_job_loop_iteration(&job_state).await;

    info!("web_content_scraping loop finished; waiting...");
    thread::sleep(Duration::from_secs(60));
  }
}

// NB: No failures at this level, because we don't want to prevent progress on a stuck feed.
async fn single_job_loop_iteration(job_state: &Arc<JobState>) {
  let statuses = vec![ScrapingStatus::New, ScrapingStatus::Failed];
  for status in statuses {
    scrape_jobs_of_status(status, job_state).await;
  }
}

async fn scrape_jobs_of_status(status: ScrapingStatus, job_state: &Arc<JobState>) {
  const BATCH_SIZE : i64 = 10;

  let mut last_id = 0;
  let mut failure_count = 0;

  loop {
    // NB: Protect sqlite from contention.
    thread::sleep(Duration::from_millis(500));

    info!("web_content_scraping querying {:?} targets from id > {} ...", &status, last_id);

    let query_result = list_web_scraping_targets(
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
      info!("Download and scrape target: {:?}", target.canonical_url);

      while job_state.app_control_state.is_scraping_paused() {
        thread::sleep(Duration::from_secs(5));
      }

      let result = process_target_record(&target, job_state).await;
      if let Err(err) = result {
        error!("Error processing target: {:?}", err);
      }

      last_id = target.id;

      thread::sleep(Duration::from_secs(3));
    }
  }
}
