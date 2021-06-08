use crate::util::anyhow_result::AnyhowResult;

// TODO: Move more shared configs here.

/// Environment variables shared between one or more jobs or the main server.
/// These are
pub struct CommonEnv {

  /// The amount of time to wait between job batches (not individual jobs).
  /// This prevents the outer loop of querying batches from flooding the DB.
  /// (In theory, there's work within jobs that prevents rapidly pegging the DB.)
  pub job_batch_wait_millis: u64,
}

impl CommonEnv {

  pub fn read_from_env() -> AnyhowResult<Self> {
    Ok(Self {
      job_batch_wait_millis: easyenv::get_env_num("JOB_BATCH_WAIT_MILLIS", 100)?,
    })
  }
}