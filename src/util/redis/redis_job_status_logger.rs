use crate::util::anyhow_result::AnyhowResult;
use crate::util::redis::redis_keys::RedisKeys;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;

pub type RedisPool = PooledConnection<RedisConnectionManager>;

pub struct RedisJobStatusLogger <'a> {
  redis: &'a mut RedisPool,
  status_key: String,
}

impl <'a> RedisJobStatusLogger <'a> {
  pub const STATUS_KEY_TTL_SECONDS : usize = 60 * 60;

  pub fn new_tts_inference(redis: &'a mut RedisPool, tts_job_token: &str) -> Self {
    let status_key = RedisKeys::tts_inference_extra_status_info(tts_job_token);
    Self { redis, status_key }
  }

  pub fn new_w2l_download(redis: &'a mut RedisPool, w2l_job_token: &str) -> Self {
    let status_key = RedisKeys::w2l_download_extra_status_info(w2l_job_token);
    Self { redis, status_key }
  }

  pub fn new_w2l_inference(redis: &'a mut RedisPool, w2l_job_token: &str) -> Self {
    let status_key = RedisKeys::w2l_inference_extra_status_info(w2l_job_token);
    Self { redis, status_key }
  }

  /// Record the status to Redis so the frontend has the latest state.
  pub fn log_status(&mut self, logging_details: &str) -> AnyhowResult<()> {
    let _r : String = self.redis // NB: Compiler can't figure out the throwaway result type
        .set_ex(&self.status_key,
          logging_details,
          Self::STATUS_KEY_TTL_SECONDS)?;
    Ok(())
  }
}
