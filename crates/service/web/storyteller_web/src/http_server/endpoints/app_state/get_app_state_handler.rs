use crate::http_server::endpoints::app_state::components::get_permissions::{get_permissions, AppStatePermissions};
use crate::http_server::endpoints::app_state::components::get_premium_info::{get_premium_info, AppStatePremiumInfo};
use crate::http_server::endpoints::app_state::components::get_server_info::{get_server_info, AppStateServerInfo};
use crate::http_server::endpoints::app_state::components::get_status_alert::{get_status_alert, AppStateStatusAlertInfo};
use crate::http_server::endpoints::app_state::components::get_user_info::{get_user_info, AppStateUserInfo};
use crate::http_server::endpoints::app_state::components::get_user_locale::{get_user_locale, AppStateUserLocale};
use crate::state::server_state::ServerState;
use actix_web::http::StatusCode;
use actix_web::web::Json;
use actix_web::{web, HttpRequest, HttpResponse, ResponseError};
use billing_component::stripe::traits::internal_user_lookup::InternalUserLookup;
use billing_component::users::http_endpoints::list_active_user_subscriptions_handler::ListActiveUserSubscriptionsError;
use enums::by_table::user_ratings::entity_type::UserRatingEntityType;
use enums::by_table::user_ratings::rating_value::UserRatingValue;
use hostname::get;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use log::{error, info};
use mysql_queries::composite_keys::by_table::user_ratings::user_rating_entity::UserRatingEntity;
use mysql_queries::queries::users::user_ratings::get_user_rating::{get_user_rating, Args};
use std::sync::Arc;
use std::time::Duration;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use utoipa::ToSchema;

// TODO: This is based on status_alert_handler
/// How often the client should poll
const REFRESH_INTERVAL: Duration = Duration::from_secs(60);

// =============== Success Response ===============

// DONE:
//   - server_info (once)
//   - detect_locale (once)
//   - status_alert_check (60 seconds)
//   - active_subscriptions
// TODO:
//   - session
#[derive(Serialize, ToSchema)]
pub struct AppStateResponse {
  /// All endpoints return `success = true` on 200.
  pub success: bool,

  /// Tell the frontend client how fast to refresh their view of this state.
  /// During an attack or outage, we may want this to go extremely slow.
  ///
  /// Regardless of this value, the client should preemptively refresh if the
  /// user logs in, logs out, creates an account, or subscribes to a premium plan,
  /// as those changes will impact some of the underlying state returned by this
  /// endpoint.
  pub refresh_interval_millis: u128,

  /// Information about the HTTP app server.
  pub server_info: AppStateServerInfo,

  /// If there's an alert about the status of the app, this will be set.
  /// The sub keys are optional, but at least one of them will be set.
  /// i.e. we can have an alert with no message or no predefined category.
  pub maybe_alert: Option<AppStateStatusAlertInfo>,

  /// Information on user locale (language codes, etc.)
  pub locale: AppStateUserLocale,

  /// Whether the user is logged in.
  pub logged_in: bool,

  /// If the user is logged into an account with a valid session, this will
  /// contain the user's account info.
  pub maybe_user_info: Option<AppStateUserInfo>,

  /// Information on user permissions.
  pub permissions: AppStatePermissions,

  /// Contains details oof the user's premium subscription status.
  pub maybe_premium: Option<AppStatePremiumInfo>,
}

// /// User account information.
// /// This is only for valid logged-in users.
// #[derive(Serialize, ToSchema)]
// pub struct AppStateUserAccountInfo {
//   /// Information on the user's account
//   pub account: String,
//
//   /// Details on the user's premium subscription status.
//   pub premium: AppStatePremiumInfo,
// }

// =============== Error Response ===============

#[derive(Debug, Serialize, ToSchema)]
pub enum AppStateError {
  ServerError,
}

impl ResponseError for AppStateError {
  fn status_code(&self) -> StatusCode {
    match *self {
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
///  - `GET /v1/billing/active_subscriptions` (TODO: port new logic to old endpoint)
///  - `GET /v1/status_alert_check`
///  - `GET /v1/session`
///
/// This endpoint will probably grow new functionality in the future as well.
#[utoipa::path(
  get,
  tag = "App State",
  path = "/v1/app_state",
  responses(
    (status = 200, description = "Success response", body = AppStateResponse),
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
      .maybe_get_user_session_extended_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        error!("Session checker error: {:?}", e);
        AppStateError::ServerError
      })?;

  let server_info = get_server_info(&server_state);
  let maybe_alert = get_status_alert(&server_state);
  let locale = get_user_locale(&http_request);

  let mut maybe_user_info = maybe_user_session
      .as_ref()
      .map(|session| get_user_info(session));

  let permissions = get_permissions(maybe_user_session.as_ref());

  let maybe_premium = maybe_user_session
      .as_ref()
      .map(|session| get_premium_info(session));

  Ok(Json(AppStateResponse {
    success: true,
    refresh_interval_millis: REFRESH_INTERVAL.as_millis(),
    server_info,
    locale,
    maybe_alert,
    maybe_user_info,
    permissions,
    maybe_premium,
    logged_in: false,
  }))
}
