use std::fmt;
use std::sync::Arc;

use actix_web::{HttpMessage, HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use chrono::{DateTime, Utc};
use log::warn;
use utoipa::ToSchema;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use enums::by_table::prompts::prompt_type::PromptType;
use enums::common::visibility::Visibility;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use mysql_queries::queries::media_files::get::get_media_file::get_media_file;
use mysql_queries::queries::prompts::get_prompt::get_prompt;
use mysql_queries::queries::tts::tts_results::query_tts_result::select_tts_result_by_token;
use tokens::tokens::batch_generations::BatchGenerationToken;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::prompts::PromptToken;
use users_component::common_responses::user_details_lite::UserDetailsLight;

use crate::http_server::common_responses::simple_entity_stats::SimpleEntityStats;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

/// For the URL PathInfo
#[derive(Deserialize, ToSchema)]
pub struct GetPromptPathInfo {
  token: PromptToken,
}

#[derive(Serialize, ToSchema)]
pub struct GetPromptSuccessResponse {
  pub success: bool,
  pub prompt: PromptInfo,
}

#[derive(Serialize, ToSchema)]
pub struct PromptInfo {
  pub token: PromptToken,

  /// The type of prompt.
  /// Note: Prompts may or may not be compatible across systems.
  pub prompt_type: PromptType,
  
  /// Positive prompt
  pub maybe_positive_prompt: Option<String>,

  /// Negative prompt
  pub maybe_negative_prompt: Option<String>,

  /// If a "style" was used, this is the name of it.
  /// This might not be present for all types of inference
  /// and typically only applies to video style transfer.
  pub maybe_style_name: Option<StyleTransferName>,

  /// If a face detailer was used.
  /// This might not be present for all types of inference
  /// and typically only applies to video style transfer.
  pub used_face_detailer: bool,

  /// If an upscaling pass was used.
  /// This might not be present for all types of inference
  /// and typically only applies to video style transfer.
  pub used_upscaler: bool,

  // TODO: Author of prompt info

  pub created_at: DateTime<Utc>,
}

#[derive(Debug, ToSchema)]
pub enum GetPromptError {
  ServerError,
  NotFound,
}

impl ResponseError for GetPromptError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetPromptError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
      GetPromptError::NotFound => StatusCode::NOT_FOUND,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetPromptError::ServerError => "server error".to_string(),
      GetPromptError::NotFound => "not found".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for GetPromptError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

#[utoipa::path(
  get,
  tag = "Prompts",
  path = "/v1/prompts/{token}",
  responses(
    (status = 200, description = "Found", body = GetPromptSuccessResponse),
    (status = 404, description = "Not found", body = GetPromptError),
    (status = 500, description = "Server error", body = GetPromptError),
  ),
  params(
    ("path" = GetPromptPathInfo, description = "Path for Request")
  )
)]
pub async fn get_prompt_handler(
  http_request: HttpRequest,
  path: Path<GetPromptPathInfo>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, GetPromptError>
{
  let prompt_token = path.into_inner().token;

  let result = get_prompt(
    &prompt_token,
    &server_state.mysql_pool
  ).await;

  let result = match result {
    Err(e) => {
      warn!("query error: {:?}", e);
      return Err(GetPromptError::ServerError);
    }
    Ok(None) => return Err(GetPromptError::NotFound),
    Ok(Some(result)) => result,
  };

  let mut maybe_style_name = None;
  let mut used_face_detailer = false;
  let mut used_upscaler = false;

  if let Some(inner_payload) = &result.maybe_other_args {
    if let Some(encoded_style_name) = &inner_payload.style_name {
      maybe_style_name = encoded_style_name.to_style_name();
    }
    used_face_detailer = inner_payload.used_face_detailer.unwrap_or(false);
    used_upscaler = inner_payload.used_upscaler.unwrap_or(false);
  }

  let response = GetPromptSuccessResponse {
    success: true,
    prompt: PromptInfo {
      token: result.token,
      maybe_positive_prompt: result.maybe_positive_prompt,
      maybe_negative_prompt: result.maybe_negative_prompt,
      maybe_style_name,
      used_face_detailer,
      used_upscaler,
      prompt_type: result.prompt_type,
      created_at: result.created_at,
    },
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| GetPromptError::ServerError)?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}
