use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use chrono::{DateTime, Utc};

use log::{info, warn};
use mysql_queries::queries::voice_designer::voice_samples::list_dataset_samples::list_samples;
use tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken;
use crate::server_state::ServerState;

#[derive(Serialize, Clone)]
pub struct ZsSampleRecordForResponse {
  sample_token: String,
  dataset_token: String,
  maybe_creator_user_token: Option<String>,

  created_at: DateTime<Utc>,
  updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ListSamplesByDatasetSuccessResponse {
  pub success: bool,
  pub samples: Vec<ZsSampleRecordForResponse>,
}

#[derive(Deserialize)]
pub struct ListSamplesByDatasetPathInfo {
  dataset_token: String,
}

#[derive(Debug)]
pub enum ListSamplesByDatasetError {
  NotAuthorized,
  ServerError,
}

impl std::fmt::Display for ListSamplesByDatasetError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl ResponseError for ListSamplesByDatasetError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListSamplesByDatasetError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListSamplesByDatasetError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

pub async fn list_samples_by_dataset_handler(
  http_request: HttpRequest,
  path: web::Path<ListSamplesByDatasetPathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListSamplesByDatasetError> {
  let maybe_user_session = server_state.session_checker.maybe_get_user_session(
    &http_request,
    &server_state.mysql_pool
  ).await.map_err(|e| {
    warn!("Session checker error: {:?}", e);
    ListSamplesByDatasetError::ServerError
  })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(ListSamplesByDatasetError::NotAuthorized);
    },
  };

  let dataset_token = ZsVoiceDatasetToken(path.dataset_token.clone());
  let is_mod = user_session.can_ban_users;

  let query_results = list_samples(
    &dataset_token,
    is_mod,
    &server_state.mysql_pool
  ).await.map_err(|e| {
    warn!("list_samples error: {:?}", e);
    ListSamplesByDatasetError::ServerError
  });

  let samples = match query_results {
    Ok(samples) => samples,
    Err(e) => {
      warn!("list_samples error: {:?}", e);
      return Err(ListSamplesByDatasetError::ServerError);
    },
  };

  let samples = samples
    .into_iter()
    .map(|sample| ZsSampleRecordForResponse {
      sample_token: sample.token.to_string(),
      dataset_token: sample.dataset_token.to_string(),
      maybe_creator_user_token: match sample.maybe_creator_user_token {
        Some(user_token) => Some(user_token.to_string()),
        None => None,
      },
      created_at: sample.created_at,
      updated_at: sample.updated_at,
    })
    .collect();

  let response = ListSamplesByDatasetSuccessResponse {
    success: true,
    samples
  };

  let body = serde_json::to_string(&response).map_err(|e| {
    warn!("json serialization error: {:?}", e);
    ListSamplesByDatasetError::ServerError
  })?;

  Ok(HttpResponse::Ok().content_type("application/json").body(body))
}
