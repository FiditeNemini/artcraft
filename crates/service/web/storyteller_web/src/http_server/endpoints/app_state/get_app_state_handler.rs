use actix_web::http::StatusCode;
use actix_web::web::Json;
use actix_web::{web, HttpRequest, HttpResponse, ResponseError};
use log::{error, info};
use std::sync::Arc;
use std::time::Duration;
use utoipa::ToSchema;

use crate::http_server::endpoints::app_state::components::get_server_info::{get_server_info, AppStateServerInfo};
use crate::http_server::endpoints::app_state::components::get_status_alert::{get_status_alert, AppStateStatusAlertInfo};
use crate::http_server::endpoints::app_state::components::get_user_locale::{get_user_locale, AppStateUserLocale};
use crate::state::server_state::ServerState;
use enums::by_table::user_ratings::entity_type::UserRatingEntityType;
use enums::by_table::user_ratings::rating_value::UserRatingValue;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::composite_keys::by_table::user_ratings::user_rating_entity::UserRatingEntity;
use mysql_queries::queries::users::user_ratings::get_user_rating::{get_user_rating, Args};
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;

// TODO: This is based on status_alert_handler
/// How often the client should poll
const REFRESH_INTERVAL: Duration = Duration::from_secs(60);

// =============== Success Response ===============

// DONE:
//   - server_info (once)
//   - detect_locale (once)
//   - status_alert_check (60 seconds)
// TODO:
//   - active_subscriptions
//   - session
#[derive(Serialize, ToSchema)]
pub struct AppStateResponse {
  pub success: bool,

  /// Tell the frontend client how fast to refresh their view of this state.
  /// During an attack or outage, we may want this to go extremely slow.
  pub refresh_interval_millis: u128,

  /// Information about the HTTP app server.
  pub server_info: AppStateServerInfo,

  /// If there's an alert about the status of the app, this will be set.
  /// The sub keys are optional, but at least one of them will be set.
  /// i.e. we can have an alert with no message or no predefined category.
  pub maybe_alert: Option<AppStateStatusAlertInfo>,

  /// Information on user locale (language codes, etc.)
  pub user_locale: AppStateUserLocale,
}

// =============== Error Response ===============

#[derive(Debug, Serialize, ToSchema)]
pub enum AppStateError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for AppStateError {
  fn status_code(&self) -> StatusCode {
    match *self {
      AppStateError::BadInput(_) => StatusCode::BAD_REQUEST,
      AppStateError::NotAuthorized => StatusCode::UNAUTHORIZED,
      AppStateError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl std::fmt::Display for AppStateError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

/// Load core application and  user state.
///
/// This endpoint loads a lot of the application state for the user and avoids lots
/// of parallel queries to various endpoints. This should help improve Google Lighthouse
/// and Core Web Vitals scores.
///
/// This single endpoint can replace the following endpoints:
///  - `GET /detect_locale`
///  - `GET /server_info`
///  - `GET /v1/status_alert_check`
///
/// This endpoint will probably grow new functionality in the future as well.
#[utoipa::path(
  get,
  tag = "App State",
  path = "/v1/app_state",
  params(
    ("entity_type", description = "The type of the entity being rated."),
    ("entity_token", description = "Entity token"),
  ),
  responses(
    (status = 200, description = "List User Bookmarks", body = AppStateResponse),
    (status = 400, description = "Bad input", body = AppStateError),
    (status = 401, description = "Not authorized", body = AppStateError),
    (status = 500, description = "Server error", body = AppStateError),
  ),
)]
pub async fn get_app_state_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> Result<Json<AppStateResponse>, AppStateError>
{
  let mut mysql_connection = server_state.mysql_pool.acquire()
      .await
      .map_err(|e| {
        error!("Could not acquire DB pool: {:?}", e);
        AppStateError::ServerError
      })?;

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        error!("Session checker error: {:?}", e);
        AppStateError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      info!("not logged in");
      return Err(AppStateError::NotAuthorized);
    }
  };

  let server_info = get_server_info(&server_state);
  let user_locale = get_user_locale(&http_request);
  let maybe_alert = get_status_alert(&server_state);

  Ok(Json(AppStateResponse {
    success: true,
    refresh_interval_millis: REFRESH_INTERVAL.as_millis(),
    server_info,
    user_locale,
    maybe_alert,
  }))
}
