// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use log::warn;

use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use mysql_queries::queries::favorites::favorite_entity_token::FavoriteEntityToken;
use mysql_queries::queries::favorites::create_favorite::{create_favorite, CreateFavoriteArgs};
use tokens::tokens::favorites::FavoriteToken;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

#[derive(Deserialize)]
pub struct CreateFavoriteRequest {
  entity_token: String,
  entity_type: FavoriteEntityType,
}

#[derive(Serialize)]
pub struct CreateFavoriteSuccessResponse {
  pub success: bool,
  pub favorite_token: FavoriteToken,
}

#[derive(Debug)]
pub enum CreateFavoriteError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for CreateFavoriteError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateFavoriteError::BadInput(_) => StatusCode::BAD_REQUEST,
      CreateFavoriteError::NotAuthorized => StatusCode::UNAUTHORIZED,
      CreateFavoriteError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      CreateFavoriteError::BadInput(reason) => reason.to_string(),
      CreateFavoriteError::NotAuthorized => "unauthorized".to_string(),
      CreateFavoriteError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CreateFavoriteError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn create_favorite_handler(
  http_request: HttpRequest,
  request: web::Json<CreateFavoriteRequest>,
  server_state: web::Data<Arc<ServerState>>,
) -> Result<HttpResponse, CreateFavoriteError>
{
  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        CreateFavoriteError::ServerError
      })?;

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        CreateFavoriteError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(CreateFavoriteError::NotAuthorized);
    }
  };

  let entity_token = FavoriteEntityToken::from_entity_type_and_token(
    request.entity_type, &request.entity_token);

  let query_result = create_favorite(CreateFavoriteArgs {
    entity_token: &entity_token,
    user_token: &user_session.user_token_typed,
    mysql_executor: &mut *mysql_connection,
    phantom: Default::default(),
  }).await;

  let favorite_token = match query_result {
    Ok(token) => token,
    Err(err) => {
      warn!("error inserting favorite: {:?}", err);
      return Err(CreateFavoriteError::ServerError);
    }
  };

  let response = CreateFavoriteSuccessResponse {
    success: true,
    favorite_token,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| CreateFavoriteError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
