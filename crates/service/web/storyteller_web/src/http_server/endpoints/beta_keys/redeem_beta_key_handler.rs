use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::warn;
use utoipa::ToSchema;

use enums::by_table::comments::comment_entity_type::CommentEntityType;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::queries::beta_keys::get_beta_key_by_value::get_beta_key_by_value;
use mysql_queries::queries::comments::comment_entity_token::CommentEntityToken;
use mysql_queries::queries::comments::insert_comment::{insert_comment, InsertCommentArgs};
use tokens::tokens::comments::CommentToken;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_results::TtsResultToken;
use tokens::tokens::users::UserToken;
use tokens::tokens::w2l_results::W2lResultToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use user_input_common::check_for_slurs::contains_slurs;
use user_input_common::markdown_to_html::markdown_to_html;

use crate::http_server::endpoints::beta_keys::list_beta_keys_handler::ListBetaKeysError;
use crate::http_server::endpoints::moderation::user_feature_flags::edit_user_feature_flags_handler::EditUserFeatureFlagsError;
use crate::http_server::web_utils::require_moderator::RequireModeratorError;
use crate::http_server::web_utils::require_user_session::{require_user_session, RequireUserSessionError};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

#[derive(Deserialize, ToSchema)]
pub struct RedeemBetaKeyRequest {
  beta_key: String,
}

#[derive(Serialize, ToSchema)]
pub struct RedeemBetaKeySuccessResponse {
  pub success: bool,
}

#[derive(Debug, ToSchema)]
pub enum RedeemBetaKeyError {
  BadInput(String),
  NotAuthorized,
  NotFound,
  ServerError,
}

impl ResponseError for RedeemBetaKeyError {
  fn status_code(&self) -> StatusCode {
    match *self {
      RedeemBetaKeyError::BadInput(_) => StatusCode::BAD_REQUEST,
      RedeemBetaKeyError::NotAuthorized => StatusCode::UNAUTHORIZED,
      RedeemBetaKeyError::NotFound => StatusCode::NOT_FOUND,
      RedeemBetaKeyError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      RedeemBetaKeyError::BadInput(reason) => reason.to_string(),
      RedeemBetaKeyError::NotAuthorized => "unauthorized".to_string(),
      RedeemBetaKeyError::NotFound => "not found".to_string(),
      RedeemBetaKeyError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for RedeemBetaKeyError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

/// Redeem a beta key to gain access to a feature
#[utoipa::path(
  post,
  tag = "Beta Keys",
  path = "/v1/beta_keys/redeem",
  responses(
    (status = 200, description = "Success", body = RedeemBetaKeySuccessResponse),
    (status = 400, description = "Bad input", body = RedeemBetaKeyError),
    (status = 401, description = "Not authorized", body = RedeemBetaKeyError),
    (status = 404, description = "Not found", body = RedeemBetaKeyError),
    (status = 500, description = "Server error", body = RedeemBetaKeyError),
  ),
  params(
    ("request" = RedeemBetaKeyRequest, description = "Payload for Request"),
  )
)]
pub async fn redeem_beta_key_handler(
  http_request: HttpRequest,
  request: web::Json<RedeemBetaKeyRequest>,
  server_state: web::Data<Arc<ServerState>>,
) -> Result<HttpResponse, RedeemBetaKeyError>
{
  let user_session = require_user_session(&http_request, &server_state)
      .await
      .map_err(|err| match err {
        RequireUserSessionError::ServerError => RedeemBetaKeyError::ServerError,
        RequireUserSessionError::NotAuthorized => RedeemBetaKeyError::NotAuthorized,
      })?;

  let maybe_beta_key = get_beta_key_by_value(&request.beta_key, &server_state.mysql_pool)
      .await
      .map_err(|err| {
        warn!("Error getting beta key by value: {:?}", &err);
        RedeemBetaKeyError::ServerError
      })?;

  let beta_key = match maybe_beta_key {
    Some(beta_key) => beta_key,
    None => return Err(RedeemBetaKeyError::NotFound),
  };

  if beta_key.maybe_redeemed_at.is_some() || beta_key.maybe_redeemer_user_token.is_some() {
    return Err(RedeemBetaKeyError::BadInput("beta key already redeemed".to_string()));
  }

  let response = RedeemBetaKeySuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| RedeemBetaKeyError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
