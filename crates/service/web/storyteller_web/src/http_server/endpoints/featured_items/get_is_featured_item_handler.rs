use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use log::{error, warn};
use r2d2_redis::redis::transaction;
use sqlx::Acquire;
use utoipa::ToSchema;

use composite_identifiers::by_table::audit_logs::audit_log_entity::AuditLogEntity;
use composite_identifiers::by_table::featured_items::featured_item_entity::FeaturedItemEntity;
use enums::by_table::audit_logs::audit_log_entity_action::AuditLogEntityAction;
use enums::by_table::featured_items::featured_item_entity_type::FeaturedItemEntityType;
use http_server_common::request::get_request_ip::get_request_ip;
use mysql_queries::queries::audit_logs::insert_audit_log::{insert_audit_log, InsertAuditLogArgs};
use mysql_queries::queries::audit_logs::insert_audit_log_transactional::{insert_audit_log_transactional, InsertAuditLogTransactionalArgs};
use mysql_queries::queries::entity_stats::stats_entity_token::StatsEntityToken;
use mysql_queries::queries::entity_stats::upsert_entity_stats_on_bookmark_event::{BookmarkAction, upsert_entity_stats_on_bookmark_event, UpsertEntityStatsArgs};
use mysql_queries::queries::featured_items::get_is_featured_by_token::get_is_featured_by_token;
use mysql_queries::queries::featured_items::upsert_featured_item::{upsert_featured_item, UpsertFeaturedItemArgs};
use mysql_queries::queries::users::user_bookmarks::get_total_bookmark_count_for_entity::get_total_bookmark_count_for_entity;
use mysql_queries::queries::users::user_bookmarks::get_user_bookmark_transactional_locking::{BookmarkIdentifier, get_user_bookmark_transactional_locking};
use mysql_queries::queries::users::user_bookmarks::user_bookmark_entity_token::UserBookmarkEntityToken;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_results::TtsResultToken;
use tokens::tokens::user_bookmarks::UserBookmarkToken;
use tokens::tokens::users::UserToken;
use tokens::tokens::voice_conversion_models::VoiceConversionModelToken;
use tokens::tokens::w2l_results::W2lResultToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::tokens::zs_voices::ZsVoiceToken;

use crate::http_server::endpoints::weights::get_weight_handler::GetWeightPathInfo;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::state::server_state::ServerState;

#[derive(Deserialize, ToSchema)]
pub struct GetIsFeaturedItemPathInfo {
  entity_token: String,
  entity_type: FeaturedItemEntityType,
}

#[derive(Serialize, ToSchema)]
pub struct GetIsFeaturedItemSuccessResponse {
  pub success: bool,
  pub is_featured: bool,
}

#[derive(Debug, ToSchema)]
pub enum GetIsFeaturedItemError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for GetIsFeaturedItemError {
  fn status_code(&self) -> StatusCode {
    match *self {
      GetIsFeaturedItemError::BadInput(_) => StatusCode::BAD_REQUEST,
      GetIsFeaturedItemError::NotAuthorized => StatusCode::UNAUTHORIZED,
      GetIsFeaturedItemError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      GetIsFeaturedItemError::BadInput(reason) => reason.to_string(),
      GetIsFeaturedItemError::NotAuthorized => "unauthorized".to_string(),
      GetIsFeaturedItemError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for GetIsFeaturedItemError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

/// Determine if an item is featured
#[utoipa::path(
  get,
  tag = "Featured Items",
  path = "/v1/featured_item/is_featured/{entity_type}/{entity_token}",
  request_body = GetIsFeaturedItemRequest,
  responses(
    (status = 200, body = GetIsFeaturedItemSuccessResponse),
    (status = 400, body = GetIsFeaturedItemError),
  )
)]
pub async fn get_is_featured_item_handler(
  http_request: HttpRequest,
  path: Path<GetIsFeaturedItemPathInfo>,
  server_state: web::Data<Arc<ServerState>>,
) -> Result<HttpResponse, GetIsFeaturedItemError>
{
  // NB(bt,2023-12-14): Kasisnu found that we're getting entity type mismatches in production. Apart from
  // querying the database for entity existence, this is the next best way to prevent incorrect comment
  // attachment. This is a bit of a bad process, though, since the token types are supposed to be opaque.
  let token = path.entity_token.as_str();
  let token_prefix_matches = match path.entity_type {
    // NB: Users had an older prefix (U:) that got replaced with the new prefix (user_)
    FeaturedItemEntityType::User => token.starts_with(UserToken::token_prefix()) || token.starts_with("U:"),
    FeaturedItemEntityType::MediaFile => token.starts_with(MediaFileToken::token_prefix()),
    FeaturedItemEntityType::ModelWeight => token.starts_with(ModelWeightToken::token_prefix()),
  };

  if !token_prefix_matches {
    warn!("invalid token prefix: {:?} for {:?}", path.entity_token, path.entity_type);
    return Err(GetIsFeaturedItemError::BadInput("invalid token prefix".to_string()));
  }

  let entity = FeaturedItemEntity::from_entity_type_and_token(path.entity_type, &path.entity_token);

  let is_featured = get_is_featured_by_token(&entity, &server_state.mysql_pool)
      .await
      .map_err(|err| {
        warn!("MySql error: {:?}", err);
        GetIsFeaturedItemError::ServerError
      })?;

  let response = GetIsFeaturedItemSuccessResponse {
    success: true,
    is_featured: is_featured.is_featured,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| GetIsFeaturedItemError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
