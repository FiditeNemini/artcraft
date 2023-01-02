use crate::job_steps::job_dependencies::JobDependencies;
use crate::job_steps::process_single_job_old::process_single_job_old;
use database_queries::queries::generic_inference::job::list_available_generic_inference_jobs::{AvailableInferenceJob, list_available_generic_inference_jobs, ListAvailableGenericInferenceJobArgs};
use database_queries::queries::generic_inference::job::mark_generic_inference_job_failure::mark_generic_inference_job_failure;
use errors::AnyhowResult;
use jobs_common::noop_logger::NoOpLogger;
use log::{error, info, warn};
use std::time::Duration;
use crate::job_steps::process_single_job::process_single_job;

// Job runner timeouts (guards MySQL)
const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

pub async fn main_loop(job_dependencies: JobDependencies) {
  let mut noop_logger = NoOpLogger::new(job_dependencies.no_op_logger_millis as i64);

  let mut error_timeout_millis = START_TIMEOUT_MILLIS;
  let mut sort_by_priority = true;
  let mut sort_by_priority_count = 0;

  loop {
    // Don't completely starve low-priority jobs
    if sort_by_priority_count >= job_dependencies.low_priority_starvation_prevention_every_nth {
      sort_by_priority_count = 0;
      sort_by_priority = false;
    }

    let maybe_available_jobs = list_available_generic_inference_jobs(ListAvailableGenericInferenceJobArgs {
      num_records: job_dependencies.job_batch_size,
      is_debug_worker: false, // TODO
      sort_by_priority,
      maybe_scope_by_job_type: None, // TODO
      mysql_pool: &job_dependencies.mysql_pool,
    }).await;

    sort_by_priority = true;
    sort_by_priority_count += 1;

    let jobs = match maybe_available_jobs {
      Ok(jobs) => jobs,
      Err(e) => {
        error!("Error querying jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    };

    if jobs.is_empty() {
      noop_logger.log_message_after_awhile("No jobs picked up from database!");
      std::thread::sleep(Duration::from_millis(job_dependencies.job_batch_wait_millis));
      error_timeout_millis = START_TIMEOUT_MILLIS; // reset
      continue;
    }

    info!("Queried {} jobs from database", jobs.len());

    let batch_result = process_job_batch(&job_dependencies, jobs).await;

    match batch_result {
      Ok(_) => {},
      Err(e) => {
        error!("Error processing jobs: {:?}", e);
        std::thread::sleep(Duration::from_millis(error_timeout_millis));
        error_timeout_millis += INCREASE_TIMEOUT_MILLIS;
        continue;
      }
    }

    error_timeout_millis = START_TIMEOUT_MILLIS; // reset

    std::thread::sleep(Duration::from_millis(job_dependencies.job_batch_wait_millis));
  }
}

// TODO: A common interface/trait for each submodule (tts, webvc) to declare how to determine if the job is "ready".
//  This probably returns a struct or enum with some measure of how many GB need to be downloaded.

async fn process_job_batch(job_state: &JobState, jobs: Vec<AvailableInferenceJob>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_single_job(job_state, &job).await;
    match result {
      Ok(_) => {},
      Err(e) => {
        warn!("Failure to process job: {:?}", e);
        let failure_reason = "";
        let _r = mark_generic_inference_job_failure(
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
