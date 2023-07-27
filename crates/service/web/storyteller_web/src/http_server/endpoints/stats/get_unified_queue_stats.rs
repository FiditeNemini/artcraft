use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use chrono::NaiveDateTime;
use crate::ServerState;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use errors::AnyhowResult;
use hyper::StatusCode;
use log::{debug, error, info, warn};
use mysql_queries::queries::generic_inference::web::get_pending_inference_job_count::get_pending_inference_job_count;
use mysql_queries::queries::stats::get_unified_queue_stats::{get_unified_queue_stats, UnifiedQueueStatsResult};
use redis_common::redis_cache_keys::RedisCacheKeys;
use std::sync::Arc;

#[derive(Serialize)]
pub struct GetUnifiedQueueStatsSuccessResponse {
  pub success: bool,
  pub cache_time: NaiveDateTime,

  /// Tell the frontend client how fast to refresh their view of this list.
  /// During an attack, we may want this to go extremely slow.
  pub refresh_interval_millis: u64,

  pub inference: TtsQueueStats,
  pub legacy_tts: TtsQueueStats,
}

#[derive(Serialize)]
pub struct TtsQueueStats {
  pub pending_job_count: u64,
}

#[derive(Serialize)]
pub struct InferenceQueueStats {
  pub pending_job_count: u64,
}


#[derive(Debug)]
pub enum GetUnifiedQueueStatsError {
  ServerError,
}

impl ResponseError for GetUnifiedQueueStatsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetUnifiedQueueStatsError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetUnifiedQueueStatsError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for GetUnifiedQueueStatsError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_unified_queue_stats_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, GetUnifiedQueueStatsError> {

  if server_state.flags.disable_unified_queue_stats_endpoint {
    // NB: Despite the cache being a powerful protector of the database (this is an expensive query),
    // if the cache goes stale during an outage, there is no protection. This feature flag lets us
    // shut off all traffic to the endpoint.
    return render_response_busy(GetUnifiedQueueStatsSuccessResponse {
      success: true,
      cache_time: NaiveDateTime::from_timestamp(0, 0),
      refresh_interval_millis: server_state.flags.frontend_unified_queue_stats_refresh_interval_millis,
      inference: TtsQueueStats { pending_job_count: 10_000 },
      legacy_tts: TtsQueueStats { pending_job_count: 10_000 },
    });
  }

  let maybe_cached = server_state.caches.ephemeral.queue_stats.grab_copy_without_bump_if_unexpired()
      .map_err(|e| {
        error!("error consulting cache: {:?}", e);
        GetUnifiedQueueStatsError::ServerError
      })?;

  let stats_result = match maybe_cached {
    Some(cached) => {
      debug!("serving from in-memory cache");
      cached
    },
    None => {
      debug!("populating unified queue stats from Redis *OR* database");

      let mysql_pool = server_state.mysql_pool.clone();

      let get_stats = move || {
        // NB: async closures are not yet stable in Rust, so we include an async block.
        async move {
          debug!("querying from database...");
          get_unified_queue_stats(
            &mysql_pool
          ).await
        }
      };

      // NB(2023-07-27): Double layers of caching (in-memory + Redis) is probably exorbitant, but this seems fine for now.
      // This endpoint's query (even when in-memory cached across the cluster) was causing the DB CPU to hit 100%.
      let stats_query_result = match server_state.redis_ttl_cache.get_connection() {
        Err(err) => {
          warn!("Error loading Redis connection from TTL cache (calling DB instead): {:?}", err);
          get_stats().await
        }
        Ok(mut redis_ttl_cache) => {
          let cache_key = RedisCacheKeys::get_unified_queue_stats_endpoint();
          redis_ttl_cache.lazy_load_if_not_cached(&cache_key, move || {
            get_stats()
          }).await
        }
      };

      match stats_query_result {
        // If the database misbehaves (eg. DDoS), let's stop spamming it.
        // We'll attempt to read the old value from the cache and keep going.
        Err(err) => {
          warn!("error querying database / inserting into cache: {:?}", err);

          let maybe_cached = server_state.caches.ephemeral.queue_stats.grab_even_expired_and_bump()
              .map_err(|err| {
                error!("error consulting cache (even expired): {:?}", err);
                GetUnifiedQueueStatsError::ServerError
              })?;

          maybe_cached.ok_or_else(|| {
            error!("error querying database and subsequently reading cache: {:?}", err);
            GetUnifiedQueueStatsError::ServerError
          })?
        }

        // Happy path...
        Ok(Some(stats_result)) => {
          server_state.caches.ephemeral.queue_stats.store_copy(&stats_result)
              .map_err(|e| {
                error!("error storing cache: {:?}", e);
                GetUnifiedQueueStatsError::ServerError
              })?;

          stats_result
        }

        Ok(None) => {
          // NB: This should be impossible since the DB always returns "Some"
          // (We artificially wrapped the result in Option<T>.)
          UnifiedQueueStatsResult {
            generic_job_count: 10_000,
            legacy_tts_job_count: 10_000,
            present_time: NaiveDateTime::from_timestamp(0, 0),
          }
        }
      }
    },
  };

  render_response_ok(GetUnifiedQueueStatsSuccessResponse {
    success: true,
    cache_time: stats_result.present_time,
    refresh_interval_millis: server_state.flags.frontend_pending_inference_refresh_interval_millis,
    inference: TtsQueueStats { pending_job_count: stats_result.generic_job_count },
    legacy_tts: TtsQueueStats { pending_job_count: stats_result.legacy_tts_job_count },
  })
}

pub fn render_response_busy(response: GetUnifiedQueueStatsSuccessResponse) -> Result<HttpResponse, GetUnifiedQueueStatsError> {
  let body = render_response_payload(response)?;
  Ok(HttpResponse::TooManyRequests()
      .content_type("application/json")
      .body(body))
}

pub fn render_response_ok(response: GetUnifiedQueueStatsSuccessResponse) -> Result<HttpResponse, GetUnifiedQueueStatsError> {
  let body = render_response_payload(response)?;
  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}

pub fn render_response_payload(response: GetUnifiedQueueStatsSuccessResponse) -> Result<String, GetUnifiedQueueStatsError> {
  let body = serde_json::to_string(&response)
      .map_err(|e| {
        error!("error returning response: {:?}",  e);
        GetUnifiedQueueStatsError::ServerError
      })?;
  Ok(body)
}
