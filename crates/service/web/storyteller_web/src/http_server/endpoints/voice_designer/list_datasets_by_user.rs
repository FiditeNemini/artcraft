use std::fmt;
use std::fmt::{Formatter};
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use chrono::{DateTime, Utc};

use log::{info, warn};
use mysql_queries::queries::voice_designer::datasets::list_datasets::{list_datasets_by_token, list_datasets_with_connection};

use crate::server_state::ServerState;

#[derive(Serialize, Clone)]
pub struct ZsDatasetRecordForResponse {
  dataset_token: String,
  title: String,
  creator_set_visibility: String,
  ietf_language_tag: String,
  ietf_primary_language_subtag: String,
  maybe_creator_user_token: Option<String>,

  created_at: DateTime<Utc>,
  updated_at: DateTime<Utc>,
}


#[derive(Serialize)]
pub struct ListDatasetsByUserSuccessResponse {
  pub success: bool,
  pub datasets: Vec<ZsDatasetRecordForResponse>,
}

#[derive(Deserialize)]
pub struct ListDatasetsByUserPathInfo {
  user_token: String,
}

#[derive(Debug)]
pub enum ListDatasetsByUserError {
  NotAuthorized,
  ServerError,
}

impl fmt::Display for ListDatasetsByUserError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl ResponseError for ListDatasetsByUserError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListDatasetsByUserError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListDatasetsByUserError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

pub async fn list_datasets_by_user_handler(
  http_request: HttpRequest,
  path: Path<ListDatasetsByUserPathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListDatasetsByUserError> {

  //TOOD(kasisnu):
  // [ ] double check if the fields in the struct are everything needed for the FE


  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListDatasetsByUserError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(ListDatasetsByUserError::NotAuthorized);
    }
  };

  let user_token = path.user_token.clone();
  let is_mod = user_session.can_ban_users;

  // TODO(kasisnu): fix this so this matches "private" scoping - did that mean visibility cause the user token is in the path
  let query_results = list_datasets_by_token(&server_state.mysql_pool, Some(&user_token), is_mod).await.map_err(|e| {
    warn!("Error querying for datasets: {:?}", e);
    ListDatasetsByUserError::ServerError
  });
  let datasets = match query_results {
    Ok(datasets) => datasets,
    Err(e) => {
      warn!("Error querying for datasets: {:?}", e);
      return Err(ListDatasetsByUserError::ServerError);
    }
  };

  let datasets = datasets.into_iter().map(|dataset| {
    ZsDatasetRecordForResponse {
      dataset_token: dataset.dataset_token,
      title: dataset.title,
      creator_set_visibility: dataset.creator_set_visibility.to_string() ,
      ietf_language_tag: dataset.ietf_language_tag,
      ietf_primary_language_subtag: dataset.ietf_primary_language_subtag,
      maybe_creator_user_token: dataset.maybe_creator_user_token,

      created_at: dataset.created_at,
      updated_at: dataset.updated_at,
    }
  }).collect();

  let response = ListDatasetsByUserSuccessResponse {
      success: true,
      datasets,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| ListDatasetsByUserError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
