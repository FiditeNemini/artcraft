use std::fmt;
use std::fmt::{Formatter};
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use chrono::{DateTime, Utc};

use log::{info, warn};

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

pub async fn list_datasets_by_user_handler(user_token: web::Path<String>) -> HttpResponse {

  //TOOD(kasisnu):
  // [ ] confirm if we need a feature flag to disable this endpoint
  // [ ] check if this needs to be cached in Redis/anywhere - what's the diff between ephemeral/durable
  // [ ] double check if the fields in the struct are everything needed for the FE
  // [ ] Mocks have a few datapoints I think I didn't track anywhere - stars/likes/plays/favorites



  // Implementation for listing datasets for a user
  HttpResponse::Ok().json(format!("List of datasets for user {}", user_token))
}
