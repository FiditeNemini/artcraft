use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use log::warn;
use utoipa::ToSchema;

use crockford::crockford_entropy_lower;
use enums::by_table::beta_keys::beta_key_product::BetaKeyProduct;
use enums::by_table::comments::comment_entity_type::CommentEntityType;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::queries::beta_keys::edit_beta_key_distributed_flag::edit_beta_key_distributed_flag;
use mysql_queries::queries::beta_keys::edit_beta_key_note::edit_beta_key_note;
use mysql_queries::queries::beta_keys::insert_batch_beta_keys::{insert_batch_beta_keys, InsertBatchArgs};
use mysql_queries::queries::comments::comment_entity_token::CommentEntityToken;
use mysql_queries::queries::comments::insert_comment::{insert_comment, InsertCommentArgs};
use mysql_queries::queries::users::user_profiles::get_user_profile_by_username::get_user_profile_by_username;
use tokens::tokens::beta_keys::BetaKeyToken;
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

use crate::http_server::endpoints::media_files::get::get_media_file_handler::GetMediaFilePathInfo;
use crate::http_server::endpoints::moderation::user_feature_flags::edit_user_feature_flags_handler::EditUserFeatureFlagsError;
use crate::http_server::web_utils::require_moderator::{require_moderator, RequireModeratorError, UseDatabase};
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::state::server_state::ServerState;

/// For the URL PathInfo
#[derive(Deserialize, ToSchema)]
pub struct EditBetaKeyDistributedFlagPathInfo {
  token: BetaKeyToken,
}

#[derive(Deserialize, ToSchema)]
pub struct EditBetaKeyDistributedFlagRequest {
  /// Whether to mark the flag as "distributed", i.e. we gave the key to someone.
  /// This will help us not to give out the same key twice.
  is_distributed: bool,
}

#[derive(Serialize, ToSchema)]
pub struct EditBetaKeyDistributedFlagSuccessResponse {
  pub success: bool,
}

#[derive(Debug, ToSchema)]
pub enum EditBetaKeyDistributedFlagError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for EditBetaKeyDistributedFlagError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditBetaKeyDistributedFlagError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditBetaKeyDistributedFlagError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditBetaKeyDistributedFlagError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditBetaKeyDistributedFlagError::BadInput(reason) => reason.to_string(),
      EditBetaKeyDistributedFlagError::NotAuthorized => "unauthorized".to_string(),
      EditBetaKeyDistributedFlagError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for EditBetaKeyDistributedFlagError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

/// Edit the "distributed" flag on a beta key to mark it as shared
#[utoipa::path(
  post,
  tag = "Beta Keys",
  path = "/v1/beta_keys/{token}/distributed",
  responses(
    (status = 200, description = "Success", body = EditBetaKeyDistributedFlagSuccessResponse),
    (status = 400, description = "Bad input", body = EditBetaKeyDistributedFlagError),
    (status = 401, description = "Not authorized", body = EditBetaKeyDistributedFlagError),
    (status = 500, description = "Server error", body = EditBetaKeyDistributedFlagError),
  ),
  params(
    ("request" = EditBetaKeyDistributedFlagRequest, description = "Payload for Request"),
    ("path" = EditBetaKeyDistributedFlagPathInfo, description = "Path for Request")
  )
)]
pub async fn edit_beta_key_distributed_flag_handler(
  http_request: HttpRequest,
  request: web::Json<EditBetaKeyDistributedFlagRequest>,
  path: Path<EditBetaKeyDistributedFlagPathInfo>,
  server_state: web::Data<Arc<ServerState>>,
) -> Result<HttpResponse, EditBetaKeyDistributedFlagError>
{
  let user_session = require_moderator(&http_request, &server_state, UseDatabase::Implicit)
      .await
      .map_err(|err| match err {
        RequireModeratorError::ServerError => EditBetaKeyDistributedFlagError::ServerError,
        RequireModeratorError::NotAuthorized => EditBetaKeyDistributedFlagError::NotAuthorized,
      })?;

  edit_beta_key_distributed_flag(&path.token, request.is_distributed, &server_state.mysql_pool)
      .await
      .map_err(|err| {
        warn!("Error editing beta key note: {:?}", err);
        EditBetaKeyDistributedFlagError::ServerError
      })?;

  let response = EditBetaKeyDistributedFlagSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| EditBetaKeyDistributedFlagError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
