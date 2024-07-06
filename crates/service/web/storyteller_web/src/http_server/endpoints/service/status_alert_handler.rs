use std::sync::Arc;
use std::time::Duration;

use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use actix_web::http::StatusCode;
use utoipa::ToSchema;

use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

use crate::state::server_state::ServerState;

/// How often the client should poll
const REFRESH_INTERVAL: Duration = Duration::from_secs(60);

#[derive(Serialize, ToSchema)]
pub struct StatusAlertResponse {
  pub success: bool,

  /// If there's an alert, this will be set.
  /// The sub keys are optional, but at least one of them will be set.
  /// i.e. we can have an alert with no message or no predefined category.
  pub maybe_alert: Option<StatusAlertInfo>,

  /// Tell the frontend client how fast to refresh their view of this list.
  /// During an attack, we may want this to go extremely slow.
  pub refresh_interval_millis: u64,
}

#[derive(Serialize, ToSchema)]
pub struct StatusAlertInfo {
  /// If an alert is set, this might be a key for a common i18n message to show.
  pub maybe_category: Option<StatusAlertCategory>,

  /// We can set an optional message to show to the frontend.
  ///
  /// This field may or may not be set. If it's set, this is custom text that should
  /// be displayed to the user. For example, we might tell the user when we'll be
  /// back online, etc. Both this field and `maybe_category` are optional.
  ///
  /// If `maybe_category` is present, it should be a key for a predefined and
  /// internationalized (i18n) message stored on the frontend.
  ///
  /// Either or both of these fields may be set.
  pub maybe_message: Option<String>,
}

#[derive(Serialize, ToSchema, Copy, Clone)]
#[serde(rename_all = "snake_case")]
pub enum StatusAlertCategory {
  /// System is down for maintenance
  DownForMaintenance,
}

#[derive(Debug, Serialize, ToSchema)]
pub enum StatusAlertError {
  ServerError,
}

impl ResponseError for StatusAlertError {
  fn status_code(&self) -> StatusCode {
    match *self {
      StatusAlertError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for StatusAlertError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

#[utoipa::path(
  get,
  tag = "Misc",
  path = "/v1/status_alert_check",
  responses(
    (
      status = 200,
      description = "Check service status for frontend alert messages",
      body = StatusAlertResponse,
    ),
    (status = 500, description = "Server error", body = StatusAlertError)
  ),
)]
pub async fn status_alert_handler(
  _http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, StatusAlertError> {

  let maybe_category = server_state
      .flags
      .maybe_status_alert_category
      .as_deref()
      .map(|category| category_to_enum(&category))
      .flatten();

  let maybe_message = server_state
      .flags
      .maybe_status_alert_custom_message
      .as_deref()
      .map(|message| message.trim().to_string());

  let maybe_alert = match (maybe_category, maybe_message) {
    (None, None) => None,
    (category, message) => Some(StatusAlertInfo {
      maybe_category: category,
      maybe_message: message,
    }),
  };

  let response = StatusAlertResponse {
    success: true,
    maybe_alert,
    refresh_interval_millis: REFRESH_INTERVAL.as_millis() as u64,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| StatusAlertError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}

fn category_to_enum(category: &str) -> Option<StatusAlertCategory> {
  let key = category.trim();
  match key {
    "down_for_maintenance" => Some(StatusAlertCategory::DownForMaintenance),
    _ => None,
  }
}
