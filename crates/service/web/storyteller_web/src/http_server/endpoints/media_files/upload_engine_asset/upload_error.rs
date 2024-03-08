use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::HttpResponse;
use utoipa::ToSchema;

use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

#[derive(Debug, Serialize, ToSchema)]
pub enum EngineAssetMediaFileUploadError {
  BadInput(String),
  NotAuthorized,
  MustBeLoggedIn,
  ServerError,
  RateLimited,
}

impl ResponseError for EngineAssetMediaFileUploadError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EngineAssetMediaFileUploadError::BadInput(_) => StatusCode::BAD_REQUEST,
      EngineAssetMediaFileUploadError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EngineAssetMediaFileUploadError::MustBeLoggedIn => StatusCode::UNAUTHORIZED,
      EngineAssetMediaFileUploadError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      EngineAssetMediaFileUploadError::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

impl std::fmt::Display for EngineAssetMediaFileUploadError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}
