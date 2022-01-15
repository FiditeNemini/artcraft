use config::shared_constants::DEFAULT_REDIS_DATABASE_0_CONNECTION_STRING;
use config::shared_constants::DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING;
use container_common::anyhow_result::AnyhowResult;

// TODO: Move more shared configs here.

/// Environment variables shared between one or more jobs or the main server.
/// These do not have to have the same value for each instance, but they behave
/// similarly across all usages.
pub struct CommonEnv {

  /// The Redis connection string.
  /// This has FakeYou voice stats, rate limiters, etc.
  pub redis_0_connection_string: String,

  /// The Redis connection string.
  /// This has OBS/Twitch related functionality
  pub redis_1_connection_string: String,

  /// The amount of time to wait between job batches (not individual jobs).
  /// This prevents the outer loop of querying batches from flooding the DB.
  /// (In theory, there's work within jobs that prevents rapidly pegging the DB.)
  pub job_batch_wait_millis: u64,

  /// The maximum number of retries a job will get.
  /// After a job exhausts these attempts, it will become "dead".
  pub job_max_attempts: u8,

  /// Number of job records to query at once.
  pub job_batch_size: u32,

  /// Time to wait between no-op logger log lines.
  pub no_op_logger_millis: u64,

  /// For debugging.
  /// If nonzero, sleep before exiting the job for this amount of millis.
  /// This allows introspection of temp directories before they are unlinked.
  pub debug_job_end_sleep_millis: u64,
}

impl CommonEnv {

  pub fn read_from_env() -> AnyhowResult<Self> {
    Ok(Self {
      redis_0_connection_string: easyenv::get_env_string_or_default("REDIS_0_URL",
        DEFAULT_REDIS_DATABASE_0_CONNECTION_STRING),
      redis_1_connection_string: easyenv::get_env_string_or_default("REDIS_1_URL",
                                                                  DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING),
      job_batch_wait_millis: easyenv::get_env_num("JOB_BATCH_WAIT_MILLIS", 100)?,
      job_max_attempts: easyenv::get_env_num("JOB_MAX_ATTEMPTS", 3)?,
      job_batch_size: easyenv::get_env_num("JOB_BATCH_SIZE", 10)?,
      no_op_logger_millis: easyenv::get_env_num("NO_OP_LOGGER_MILLIS", 15_000)?,
      debug_job_end_sleep_millis: easyenv::get_env_num("DEBUG_JOB_END_SLEEP_MILLIS", 0)?,
    })
  }
}