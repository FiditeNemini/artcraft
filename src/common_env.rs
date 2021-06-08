use crate::util::anyhow_result::AnyhowResult;

// TODO: Move more shared configs here.

/// Environment variables shared between one or more jobs or the main server.
/// These do not have to have the same value for each instance, but they behave
/// similarly across all usages.
pub struct CommonEnv {

  /// The amount of time to wait between job batches (not individual jobs).
  /// This prevents the outer loop of querying batches from flooding the DB.
  /// (In theory, there's work within jobs that prevents rapidly pegging the DB.)
  pub job_batch_wait_millis: u64,

  /// The maximum number of retries a job will get.
  /// After a job exhausts these attempts, it will become "dead".
  pub job_max_attempts: u8,
}

impl CommonEnv {

  pub fn read_from_env() -> AnyhowResult<Self> {
    Ok(Self {
      job_batch_wait_millis: easyenv::get_env_num("JOB_BATCH_WAIT_MILLIS", 100)?,
      job_max_attempts: easyenv::get_env_num("JOB_MAX_ATTEMPTS", 3)?,
    })
  }
}