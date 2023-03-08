use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use chrono::NaiveDateTime;
use crate::ServerState;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use database_queries::queries::tts::tts_inference_jobs::get_pending_tts_inference_job_count::get_pending_tts_inference_job_count;
use hyper::StatusCode;
use log::{error, info};
use std::fmt;
use std::sync::Arc;
use errors::AnyhowResult;

#[derive(Serialize)]
pub struct Response {
  pub success: bool,
  pub pending_job_count: u64,
  pub cache_time: NaiveDateTime,
}


#[derive(Debug)]
pub enum GetPendingTtsInferenceJobCountError {
  ServerError,
}

impl ResponseError for GetPendingTtsInferenceJobCountError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetPendingTtsInferenceJobCountError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetPendingTtsInferenceJobCountError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for GetPendingTtsInferenceJobCountError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn get_pending_tts_inference_job_count_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, GetPendingTtsInferenceJobCountError> {

  if server_state.flags.disable_tts_queue_length_endpoint {
    // NB: Despite the cache being a powerful protector of the database (this is an expensive query),
    // if the cache goes stale during an outage, there is no protection. This feature flag lets us
    // shut off all traffic to the endpoint.
    return render_response_busy(Response {
      success: true,
      pending_job_count: 10_000,
      cache_time: NaiveDateTime::from_timestamp(0, 0),
    });
  }

  let maybe_cached = server_state.caches.tts_queue_length.copy_without_bump_if_unexpired()
      .map_err(|e| {
        error!("error consulting cache: {:?}", e);
        GetPendingTtsInferenceJobCountError::ServerError
      })?;

  let count_result = match maybe_cached {
    Some(cached) => {
      cached
    },
    None => {
      info!("populating tts queue length from database");
      let count_result = get_pending_tts_inference_job_count(&server_state.mysql_pool)
          .await
          .map_err(|e| {
            error!("error querying: {:?}",  e);
            GetPendingTtsInferenceJobCountError::ServerError
          })?;

      server_state.caches.tts_queue_length.store_copy(&count_result)
          .map_err(|e| {
            error!("error storing cache: {:?}", e);
            GetPendingTtsInferenceJobCountError::ServerError
          })?;

      count_result
    },
  };

  render_response_ok(Response {
    success: true,
    pending_job_count: count_result.record_count,
    cache_time: count_result.present_time,
  })
}

pub fn render_response_busy(response: Response) -> Result<HttpResponse, GetPendingTtsInferenceJobCountError> {
  let body = render_response_payload(response)?;
  Ok(HttpResponse::TooManyRequests()
      .content_type("application/json")
      .body(body))
}

pub fn render_response_ok(response: Response) -> Result<HttpResponse, GetPendingTtsInferenceJobCountError> {
  let body = render_response_payload(response)?;
  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}

pub fn render_response_payload(response: Response) -> Result<String, GetPendingTtsInferenceJobCountError> {
  let body = serde_json::to_string(&response)
      .map_err(|e| {
        error!("error returning response: {:?}",  e);
        GetPendingTtsInferenceJobCountError::ServerError
      })?;
  Ok(body)
}
