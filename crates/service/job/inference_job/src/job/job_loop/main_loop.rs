use crate::job::job_loop::clear_full_filesystem::clear_full_filesystem;
use crate::job::job_loop::process_single_job::process_single_job;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use errors::AnyhowResult;
use jobs_common::noop_logger::NoOpLogger;
use log::{error, info, warn};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::{AvailableInferenceJob, list_available_generic_inference_jobs, ListAvailableGenericInferenceJobArgs};
use mysql_queries::queries::generic_inference::job::mark_generic_inference_job_completely_failed::mark_generic_inference_job_completely_failed;
use mysql_queries::queries::generic_inference::job::mark_generic_inference_job_failure::mark_generic_inference_job_failure;
use std::time::Duration;
use filesys::file_exists::file_exists;
use crate::job::job_loop::process_single_job_success_case::ProcessSingleJobSuccessCase;

// Job runner timeouts (guards MySQL)
const START_TIMEOUT_MILLIS : u64 = 500;
const INCREASE_TIMEOUT_MILLIS : u64 = 1000;

/// Pause file millis
const PAUSE_FILE_EXISTS_WAIT_MILLIS : u64 = 1000 * 30;

pub async fn main_loop(job_dependencies: JobDependencies) {
  let mut noop_logger = NoOpLogger::new(job_dependencies.no_op_logger_millis as i64);

  let mut error_timeout_millis = START_TIMEOUT_MILLIS;
  let mut sort_by_priority = true;
  let mut sort_by_priority_count = 0;

  while !job_dependencies.application_shutdown.get() {
    if let Some(pause_file) = job_dependencies.fs.maybe_pause_file.as_deref() {
      while file_exists(pause_file) {
        warn!("Pause file exists. Pausing until deleted: {:?}", pause_file);
        std::thread::sleep(Duration::from_millis(PAUSE_FILE_EXISTS_WAIT_MILLIS));
      }
    }

    // Don't completely starve low-priority jobs
    if sort_by_priority_count >= job_dependencies.low_priority_starvation_prevention_every_nth {
      sort_by_priority_count = 0;
      sort_by_priority = false;
    }

    let maybe_available_jobs = list_available_generic_inference_jobs(ListAvailableGenericInferenceJobArgs {
      num_records: job_dependencies.job_batch_size,
      is_debug_worker: false, // TODO
      sort_by_priority,
      maybe_scope_by_job_category: None, // TODO
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

  warn!("Job runner main loop is shut down.");
}

// TODO: A common interface/trait for each submodule (tts, webvc) to declare how to determine if the job is "ready".
//  This probably returns a struct or enum with some measure of how many GB need to be downloaded.

async fn process_job_batch(job_dependencies: &JobDependencies, jobs: Vec<AvailableInferenceJob>) -> AnyhowResult<()> {
  for job in jobs.into_iter() {
    let result = process_single_job(job_dependencies, &job).await;
    match result {
      Ok(success_case) => {
        info!("Job loop iteration \"success\": {:?}", success_case);

        let increment_success_count = match success_case {
          ProcessSingleJobSuccessCase::JobCompleted => true,
          ProcessSingleJobSuccessCase::JobTemporarilySkippedFilesAbsent => false,
          ProcessSingleJobSuccessCase::JobSkippedForRoutingTagMismatch => false,
          ProcessSingleJobSuccessCase::LockNotObtained => false,
        };

        if increment_success_count {
          let _stats = job_dependencies.job_stats.increment_success_count().ok();
        }
      },
      Err(e) => {
        warn!("Failure to process job: {:?}", e);

        let (permanent_failure, increment_fail_count, internal_failure_reason, maybe_public_failure_reason) =
            match e {
              // Permanent failures
              ProcessSingleJobError::KeepAliveElapsed =>
                (true, true, "keepalive elapsed".to_string(), Some("keepalive elapsed")),
              ProcessSingleJobError::InvalidJob(ref err) =>
                (true, false, format!("InvalidJob: {:?}", err), Some("invalid job")),

              // Non-permanent failures
              ProcessSingleJobError::FilesystemFull =>
                (false, true, "worker filesystem full".to_string(), Some("worker filesystem full")),
              ProcessSingleJobError::Other(ref err) =>
                (false, true, format!("OtherErr: {:?}", err), None),
            };

        if increment_fail_count {
          // NB: We only increment the fail count for events that may indicate the job server is stuck.
          let stats = job_dependencies.job_stats.increment_failure_count().ok();
          warn!("Failure stats: {:?}", stats);
        }

        if permanent_failure {
          let _r = mark_generic_inference_job_completely_failed(
            &job_dependencies.mysql_pool,
            &job,
            maybe_public_failure_reason,
            Some(&internal_failure_reason),
          ).await;
        } else {
          let _r = mark_generic_inference_job_failure(
            &job_dependencies.mysql_pool,
            &job,
            maybe_public_failure_reason,
            &internal_failure_reason,
            job_dependencies.job_max_attempts
          ).await;
        }

        match e {
          // Post failure handling
          ProcessSingleJobError::FilesystemFull => {
            warn!("Clearing full filesystem...");
            clear_full_filesystem(&job_dependencies.fs.semi_persistent_cache)?;
          }
          // No-op
          ProcessSingleJobError::Other(_) => {}
          ProcessSingleJobError::InvalidJob(_) => {}
          ProcessSingleJobError::KeepAliveElapsed => {}
        }
      }
    }
  }

  Ok(())
}
