use actix_http::Error;
use actix_http::http::header;
use actix_web::cookie::Cookie;
use actix_web::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::{Path, Json};
use actix_web::{Responder, web, HttpResponse, error, HttpRequest};
use crate::database::enums::record_visibility::RecordVisibility;
use crate::database::queries::query_w2l_template::select_w2l_template_by_token;
use crate::http_server::web_utils::ip_address::get_request_ip;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::email_to_gravatar::email_to_gravatar;
use crate::util::markdown_to_html::markdown_to_html;
use crate::util::random_crockford_token::random_crockford_token;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use crate::validations::check_for_slurs::contains_slurs;
use log::{info, warn, log};
use regex::Regex;
use sqlx::MySqlPool;
use sqlx::error::DatabaseError;
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDatabaseError;
use std::sync::Arc;
use std::fmt;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::database::helpers::tokens::Tokens;

// =============== Request ===============

#[derive(Deserialize)]
pub enum ModelType {
  Tts,
  W2l,
}

#[derive(Deserialize)]
pub struct CreateCategoryRequest {
  pub name: Option<String>,
  pub model_type: Option<ModelType>,
}

// =============== Success Response ===============

#[derive(Serialize)]
pub struct CreateCategoryResponse {
  pub success: bool,
  pub token: Option<String>,
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum CreateCategoryError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for CreateCategoryError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateCategoryError::BadInput(_) => StatusCode::BAD_REQUEST,
      CreateCategoryError::NotAuthorized => StatusCode::UNAUTHORIZED,
      CreateCategoryError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using DeriveMore since Clion doesn't understand it.
impl fmt::Display for CreateCategoryError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

// =============== Handler ===============

pub async fn create_category_handler(
  http_request: HttpRequest,
  request: web::Json<CreateCategoryRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, CreateCategoryError>
{
  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        CreateCategoryError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(CreateCategoryError::NotAuthorized);
    }
  };

  // NB: First permission check.
  // TODO: We don't have a permission for categories, so we use this as a proxy.
  let is_mod = user_session.can_ban_users;

  let model_type = match request.model_type {
    None => {
      return Err(CreateCategoryError::BadInput("no model type".to_string()));
    }
    Some(ModelType::Tts) => "tts",
    Some(ModelType::W2l) => "w2l",
  };

  let name = request.name
      .clone()
      .ok_or(CreateCategoryError::BadInput("no name provided".to_string()))?;

  let category_token = Tokens::new_category()
      .map_err(|e| {
        warn!("Bad crockford token: {:?}", e);
        CreateCategoryError::ServerError
      })?;

  let creator_ip_address = get_request_ip(&http_request);

  let is_mod_approved = is_mod;

  let maybe_mod_user_token = if is_mod {
    Some(user_session.user_token.clone())
  } else {
    None
  };

  let query_result = sqlx::query!(
        r#"
INSERT INTO model_categories
SET
    token = ?,
    model_type = ?,
    name = ?,

    creator_user_token = ?,
    creator_ip_address_creation = ?,

    is_mod_approved = ?,
    maybe_mod_user_token = ?,
    can_directly_have_models = true,
    can_have_subcategories = false
        "#,

    category_token,
    model_type,
    name,
    &user_session.user_token,
    creator_ip_address,
    is_mod_approved,
    maybe_mod_user_token,
  )
  .execute(&server_state.mysql_pool)
    .await;

  match query_result {
    Ok(_) => {},
    Err(err) => {
      warn!("Create category edit DB error: {:?}", err);
      return Err(CreateCategoryError::ServerError);
    }
  };

  let response = CreateCategoryResponse {
    success: true,
    token: Some(category_token.to_string())
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| CreateCategoryError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
