use actix_web::http::StatusCode;
use actix_web::{
  HttpRequest,
  HttpResponse,
  Result as ActixResult,
  get,
};
use actix_web::web::{Json, Data};
use crate::AppState;
use std::convert::Infallible;
use std::sync::Arc;

/// Endpoint response that conveys the current configuration
/// of the service to the frontend.
#[derive(Serialize, Default, Debug)]
pub struct ServiceSettingsResponse {
  /// Minimum number of characters accepted (including leading and trailing whitespace).
  /// Usually "0" to prevent empty requests.
  text_character_limit_min: Option<usize>,

  /// Maximum number of characters accepted (including leading and trailing whitespace).
  text_character_limit_max: Option<usize>,
}

#[get("/service_settings")]
pub async fn get_service_settings(_request: HttpRequest, app_state: Data<Arc<AppState>>)
  -> ActixResult<Json<ServiceSettingsResponse>, Infallible>
{
  let app_state = app_state.into_inner();

  Ok(Json(ServiceSettingsResponse {
    text_character_limit_min: app_state.text_checker.get_min_character_length(),
    text_character_limit_max: app_state.text_checker.get_max_character_length(),
  }))
}
