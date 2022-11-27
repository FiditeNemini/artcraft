use container_common::anyhow_result::AnyhowResult;
use crate::JobState;
use crate::job_steps::process_single_job::process_single_job;
use database_queries::queries::generic_download::job::list_available_generic_download_jobs::{AvailableDownloadJob, list_available_generic_download_jobs};
use database_queries::queries::generic_download::job::mark_generic_download_job_failure::mark_generic_download_job_failure;
use jobs_common::noop_logger::NoOpLogger;
use log::warn;
use std::time::Duration;

const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

pub async fn main_loop(job_state: JobState) {
  let mut error_timeout_millis = START_TIMEOUT_MILLIS;

  let mut noop_logger = NoOpLogger::new(job_state.no_op_logger_millis as i64);

  loop {
    let num_records = 1;
    let maybe_available_jobs = list_available_generic_download_jobs(&job_state.mysql_pool, num_records).await;

    let jobs = match maybe_available_jobs {
      Ok(jobs) => jobs,
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if jobs.is_empty() {
      noop_logger.log_after_awhile();

      std::thread::sleep(Duration::from_millis(job_state.job_batch_wait_millis));
      continue;
    }

    let result = process_jobs(&job_state, jobs).await;

    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    }

    error_timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(job_state.job_batch_wait_millis));
  }
}

async fn process_jobs(job_state: &JobState, jobs: Vec<AvailableDownloadJob>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_single_job(job_state, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_generic_download_job_failure(
          &job_state.mysql_pool,
          &job,
          failure_reason,
          job_state.job_max_attempts
        ).await;
      }
    }
  }

  Ok(())
}
