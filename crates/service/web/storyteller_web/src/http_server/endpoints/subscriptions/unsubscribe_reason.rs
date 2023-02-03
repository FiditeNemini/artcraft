use actix_web::http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use http_server_common::request::get_request_ip::get_request_ip;
use crate::server_state::ServerState;
use database_queries::queries::users::user_subscriptions::insert_unsubscribe_reason::UnsubscribeReasonInsertBuilder;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, info};
use std::sync::Arc;

// =============== Request ===============

#[derive(Deserialize)]
pub struct SetUnsubscribeReasonRequest {
  /// The type of the entity being rated.
  pub reason: String,
}

// =============== Success Response ===============

#[derive(Serialize)]
pub struct SetUnsubscribeReasonResponse {
  pub success: bool,
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum SetUnsubscribeReasonError {
  NotAuthorized,
  ServerError,
}

impl ResponseError for SetUnsubscribeReasonError {
  fn status_code(&self) -> StatusCode {
    match *self {
      SetUnsubscribeReasonError::NotAuthorized => StatusCode::UNAUTHORIZED,
      SetUnsubscribeReasonError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

impl std::fmt::Display for SetUnsubscribeReasonError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

pub async fn set_unsubscribe_reason_handler(
  http_request: HttpRequest,
  request: web::Json<SetUnsubscribeReasonRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, SetUnsubscribeReasonError>
{
  let mut mysql_connection = server_state.mysql_pool.acquire()
      .await
      .map_err(|e| {
        error!("Could not acquire DB pool: {:?}", e);
        SetUnsubscribeReasonError::ServerError
      })?;

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        error!("Session checker error: {:?}", e);
        SetUnsubscribeReasonError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      info!("not logged in");
      return Err(SetUnsubscribeReasonError::NotAuthorized);
    }
  };

  let ip_address = get_request_ip(&http_request);

  UnsubscribeReasonInsertBuilder::new()
    .set_user_token(&user_session.user_token)
    .set_ip_address(&ip_address)
    .set_unsubscribe_reason(&request.reason)
    .insert(&mut mysql_connection)
    .await
    .map_err(|_e| SetUnsubscribeReasonError::ServerError)?;


  let response = SetUnsubscribeReasonResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| SetUnsubscribeReasonError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
