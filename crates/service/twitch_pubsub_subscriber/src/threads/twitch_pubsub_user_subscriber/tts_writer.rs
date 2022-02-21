use container_common::anyhow_result::AnyhowResult;
use database_queries::queries::tts::tts_inference_jobs::insert_tts_inference_job::TtsInferenceJobInsertBuilder;
use database_queries::tokens::Tokens;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use redis_common::redis_keys::RedisKeys;
use redis_common::shared_constants::STREAMER_TTS_JOB_QUEUE_TTL_SECONDS;
use sqlx::MySql;
use std::sync::Arc;
use twitch_common::cheers::remove_cheers;
use twitch_common::twitch_user_id::TwitchUserId;

pub struct TtsWriter {
  mysql_pool: Arc<sqlx::Pool<MySql>>,
  redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
  twitch_user_id: TwitchUserId,
}

impl TtsWriter {

  pub fn new(
    mysql_pool: Arc<sqlx::Pool<MySql>>,
    redis_pool: Arc<r2d2::Pool<RedisConnectionManager>>,
    twitch_user_id: TwitchUserId,
  ) -> Self {
    Self {
      mysql_pool,
      redis_pool,
      twitch_user_id,
    }
  }

  pub async fn write_tts(&self, message_text: &str) -> AnyhowResult<()> {
    //let model_token = "TM:7wbtjphx8h8v"; // "Mario *" voice (prod)
    let model_token = "TM:40m3aqtt41y0"; // "Wakko" voice (dev)
    self.write_tts_with_model(message_text, model_token).await
  }

  pub async fn write_tts_with_model(&self, message_text: &str, model_token: &str) -> AnyhowResult<()> {
    let sanitized_text = remove_cheers(message_text);
    let job_token = Tokens::new_tts_inference_job()?;

    let mut builder = TtsInferenceJobInsertBuilder::new_for_internal_tts()
        .set_is_for_twitch(true)
        .set_priority_level(1) // TODO: This shouldn't be for everyone.
        .set_job_token(&job_token)
        .set_model_token(model_token)
        .set_raw_inference_text(&sanitized_text);

    let _r = builder.insert(&self.mysql_pool).await?;

    // TODO: Report job token to frontend
    let mut redis = self.redis_pool.get()?;
    let redis_key = RedisKeys::twitch_tts_job_queue(&self.twitch_user_id.get_str());

    let _size : Option<u64> = redis.rpush(&redis_key, job_token)?;
    let _size : Option<u64> = redis.expire(&redis_key, STREAMER_TTS_JOB_QUEUE_TTL_SECONDS)?;

    Ok(())
  }
}