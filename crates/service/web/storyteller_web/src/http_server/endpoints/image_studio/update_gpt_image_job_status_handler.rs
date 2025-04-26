use std::fmt;
use std::sync::Arc;

use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Json, Path};
use actix_web::{web, HttpMessage, HttpRequest, HttpResponse};
use log::{error, warn};
use utoipa::ToSchema;
use enums::common::job_status::JobStatus;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::user_session::require_user_session::require_user_session;
use crate::state::server_state::ServerState;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::queries::generic_inference::job::mark_generic_inference_job_completely_failed::mark_generic_inference_job_completely_failed;
use mysql_queries::queries::generic_inference::web::dismiss_finished_jobs_for_user::dismiss_finished_jobs_for_user;
use mysql_queries::queries::generic_inference::web::get_inference_job_status::{get_inference_job_status, get_inference_job_status_from_connection};
use mysql_queries::queries::generic_inference::web::mark_generic_inference_job_cancelled_by_user::mark_generic_inference_job_cancelled_by_user;
use mysql_queries::queries::tts::tts_inference_jobs::mark_tts_inference_job_permanently_dead::mark_tts_inference_job_permanently_dead;
use tokens::tokens::generic_inference_jobs::InferenceJobToken;
use tokens::tokens::media_files::MediaFileToken;
use crate::http_server::endpoints::inference_job::get::get_inference_job_status_handler::GetInferenceJobStatusError;

#[derive(Deserialize, ToSchema)]
pub struct UpdateGptImageJobStatusRequest {
  /// The token of the job we're updating.
  pub job_token: InferenceJobToken,

  /// How to mark the job.
  /// A subset of the job states that are relevant to image completion status.
  pub job_status: UpdatedJobStatus,

  /// Base64-encoded image data.
  /// Only present on success.
  /// In the success case, there may be one or more images.
  pub images: Option<Vec<String>>,
}

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum UpdatedJobStatus {
  Started,
  CompleteSuccess,
  CompleteFailure,
  AttemptFailed,
  Dead,
}

#[derive(Serialize, ToSchema)]
pub struct UpdateGptImageJobStatusSuccessResponse {
  pub success: bool,
}

#[derive(Debug, ToSchema)]
pub enum UpdateGptImageJobStatusError {
  ServerError,
  NotFound,
  NotAuthorized,
}

impl ResponseError for UpdateGptImageJobStatusError {
  fn status_code(&self) -> StatusCode {
    match *self {
      UpdateGptImageJobStatusError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      UpdateGptImageJobStatusError::NotFound => StatusCode::NOT_FOUND,
      UpdateGptImageJobStatusError::NotAuthorized => StatusCode::UNAUTHORIZED,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      Self::ServerError => "server error".to_string(),
      Self::NotFound => "not found".to_string(),
      Self::NotAuthorized => "unauthorized".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for UpdateGptImageJobStatusError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

/// [INTERNAL ENDPOINT] Update a GPT Image generation job status.
/// This is called by our internal infra, not users. Keep it guarded.
/// We can do secrets-based auth later.
#[utoipa::path(
  post,
  tag = "Jobs",
  path = "/v1/image_studio/update_job_status",
  responses(
    (status = 200, body = UpdateGptImageJobStatusSuccessResponse),
    (status = 500, body = UpdateGptImageJobStatusError),
  ),
  params(
    ("request" = UpdateGptImageJobStatusRequest, description = "Request"),
  )
)]
pub async fn update_gpt_image_job_status_handler(
  http_request: HttpRequest,
  request: Json<UpdateGptImageJobStatusRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<Json<UpdateGptImageJobStatusSuccessResponse>, UpdateGptImageJobStatusError>
{
  // TODO(bt,2024-06-16): Reuse connection
  let mut mysql_connection = server_state.mysql_pool.acquire()
      .await
      .map_err(|e| {
        warn!("Could not acquire DB pool: {:?}", e);
        UpdateGptImageJobStatusError::ServerError
      })?;

  let maybe_status = get_inference_job_status(
    &request.job_token,
    &server_state.mysql_pool
  ).await;

  let record = match maybe_status {
    Ok(Some(record)) => record,
    Ok(None) => return Err(UpdateGptImageJobStatusError::NotFound),
    Err(err) => {
      error!("tts job query error: {:?}", err);
      return Err(UpdateGptImageJobStatusError::ServerError);
    }
  };

  // TODO(bt): Upload images if job was successful and create relevant media files

  // TODO(bt): Update job status

  Ok(Json(UpdateGptImageJobStatusSuccessResponse {
    success: true,
  }))
}

