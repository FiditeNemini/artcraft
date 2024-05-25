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
use crate::server_state::ServerState;

/// For the URL PathInfo
#[derive(Deserialize, ToSchema)]
pub struct EditBetaKeyNotePathInfo {
  token: BetaKeyToken,
}

#[derive(Deserialize, ToSchema)]
pub struct EditBetaKeyNoteRequest {
  /// The note.
  /// If null or empty string, the note will be cleared.
  note: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct EditBetaKeyNoteSuccessResponse {
  pub success: bool,
}

#[derive(Debug, ToSchema)]
pub enum EditBetaKeyNoteError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for EditBetaKeyNoteError {
  fn status_code(&self) -> StatusCode {
    match *self {
      EditBetaKeyNoteError::BadInput(_) => StatusCode::BAD_REQUEST,
      EditBetaKeyNoteError::NotAuthorized => StatusCode::UNAUTHORIZED,
      EditBetaKeyNoteError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      EditBetaKeyNoteError::BadInput(reason) => reason.to_string(),
      EditBetaKeyNoteError::NotAuthorized => "unauthorized".to_string(),
      EditBetaKeyNoteError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for EditBetaKeyNoteError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

/// Edit or clear a note on a beta key
#[utoipa::path(
  post,
  tag = "Beta Keys",
  path = "/v1/beta_keys/{token}/note",
  responses(
    (status = 200, description = "Success", body = EditBetaKeyNoteSuccessResponse),
    (status = 400, description = "Bad input", body = EditBetaKeyNoteError),
    (status = 401, description = "Not authorized", body = EditBetaKeyNoteError),
    (status = 500, description = "Server error", body = EditBetaKeyNoteError),
  ),
  params(
    ("request" = EditBetaKeyNoteRequest, description = "Payload for Request"),
    ("path" = EditBetaKeyNotePathInfo, description = "Path for Request")
  )
)]
pub async fn edit_beta_key_note_handler(
  http_request: HttpRequest,
  request: web::Json<EditBetaKeyNoteRequest>,
  path: Path<EditBetaKeyNotePathInfo>,
  server_state: web::Data<Arc<ServerState>>,
) -> Result<HttpResponse, EditBetaKeyNoteError>
{
  let user_session = require_moderator(&http_request, &server_state, UseDatabase::Implicit)
      .await
      .map_err(|err| match err {
        RequireModeratorError::ServerError => EditBetaKeyNoteError::ServerError,
        RequireModeratorError::NotAuthorized => EditBetaKeyNoteError::NotAuthorized,
      })?;

  let maybe_note = request.note.as_deref()
      .map(|note| note.trim())
      .filter(|note| !note.is_empty())
      .map(|note| note.to_string());

  edit_beta_key_note(&path.token, maybe_note.as_deref(), &server_state.mysql_pool)
      .await
      .map_err(|err| {
        warn!("Error editing beta key note: {:?}", err);
        EditBetaKeyNoteError::ServerError
      })?;

  let response = EditBetaKeyNoteSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| EditBetaKeyNoteError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
