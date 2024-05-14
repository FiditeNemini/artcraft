use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::warn;
use utoipa::ToSchema;

use enums::by_table::comments::comment_entity_type::CommentEntityType;
use http_server_common::request::get_request_ip::get_request_ip;
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

use crate::http_server::endpoints::moderation::user_feature_flags::edit_user_feature_flags_handler::EditUserFeatureFlagsError;
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
  ServerError,
}

impl ResponseError for RedeemBetaKeyError {
  fn status_code(&self) -> StatusCode {
    match *self {
      RedeemBetaKeyError::BadInput(_) => StatusCode::BAD_REQUEST,
      RedeemBetaKeyError::NotAuthorized => StatusCode::UNAUTHORIZED,
      RedeemBetaKeyError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      RedeemBetaKeyError::BadInput(reason) => reason.to_string(),
      RedeemBetaKeyError::NotAuthorized => "unauthorized".to_string(),
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
  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        RedeemBetaKeyError::ServerError
      })?;

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        RedeemBetaKeyError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(RedeemBetaKeyError::NotAuthorized);
    }
  };

  if !user_session.can_ban_users {
    warn!("user is not allowed to add bans: {:?}", user_session.user_token.as_str());
    return Err(RedeemBetaKeyError::NotAuthorized);
  }

  // TODO(bt,2024-05-13): Create beta key records

  let response = RedeemBetaKeySuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| RedeemBetaKeyError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
