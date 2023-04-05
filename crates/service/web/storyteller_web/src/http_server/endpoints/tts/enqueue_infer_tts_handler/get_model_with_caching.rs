use errors::AnyhowResult;
use log::error;
use mysql_queries::queries::tts::tts_models::get_tts_model::{get_tts_model_by_token_using_connection, TtsModelRecord};
use redis_caching::redis_ttl_cache::RedisTtlCache;
use redis_common::redis_cache_keys::RedisCacheKeys;
use sqlx::MySql;
use sqlx::pool::PoolConnection;

// TODO: Read from in-memory TTS List cache first (!!!) for further performance savings

pub async fn get_model_with_caching(
  model_token: &str,
  redis_ttl_cache: &RedisTtlCache,
  mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<Option<TtsModelRecord>> {

  let model_token2 = model_token.clone();

  let get_tts_model = move || {
    // NB: async closures are not yet stable in Rust, so we include an async block.
    async move {
      get_tts_model_by_token_using_connection(
        &model_token2,
        true,
        mysql_connection).await
    }
  };

  let cache_key = RedisCacheKeys::get_tts_model_endpoint(model_token);

  let mut redis_ttl_cache_connection = match redis_ttl_cache.get_connection() {
    Ok(connection) => connection,
    Err(err) => {
      // NB: Fail open (potentially dangerous).
      error!("Can't get redis cache: {:?}", err);
      return get_tts_model().await;
    }
  };

  redis_ttl_cache_connection.lazy_load_if_not_cached(&cache_key, move || {
    get_tts_model()
  }).await
}

