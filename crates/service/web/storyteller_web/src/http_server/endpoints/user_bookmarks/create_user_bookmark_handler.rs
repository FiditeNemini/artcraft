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

use enums::by_table::user_bookmarks::user_bookmark_entity_type::UserBookmarkEntityType;
use mysql_queries::queries::user_bookmarks::user_bookmark_entity_token::UserBookmarkEntityToken;
use mysql_queries::queries::user_bookmarks::create_user_bookmark::{create_user_bookmark, CreateUserBookmarkArgs};
use tokens::tokens::user_bookmarks::UserBookmarkToken;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::server_state::ServerState;

#[derive(Deserialize)]
pub struct CreateUserBookmarkRequest {
  entity_token: String,
  entity_type: UserBookmarkEntityType,
}

#[derive(Serialize)]
pub struct CreateUserBookmarkSuccessResponse {
  pub success: bool,
  pub user_bookmark_token: UserBookmarkToken,
}

#[derive(Debug)]
pub enum CreateUserBookmarkError {
  BadInput(String),
  NotAuthorized,
  ServerError,
}

impl ResponseError for CreateUserBookmarkError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateUserBookmarkError::BadInput(_) => StatusCode::BAD_REQUEST,
      CreateUserBookmarkError::NotAuthorized => StatusCode::UNAUTHORIZED,
      CreateUserBookmarkError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      CreateUserBookmarkError::BadInput(reason) => reason.to_string(),
      CreateUserBookmarkError::NotAuthorized => "unauthorized".to_string(),
      CreateUserBookmarkError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CreateUserBookmarkError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn create_user_bookmark_handler(
  http_request: HttpRequest,
  request: web::Json<CreateUserBookmarkRequest>,
  server_state: web::Data<Arc<ServerState>>,
) -> Result<HttpResponse, CreateUserBookmarkError>
{
  let mut mysql_connection = server_state.mysql_pool
      .acquire()
      .await
      .map_err(|err| {
        warn!("MySql pool error: {:?}", err);
        CreateUserBookmarkError::ServerError
      })?;

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        CreateUserBookmarkError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(CreateUserBookmarkError::NotAuthorized);
    }
  };

  let entity_token = UserBookmarkEntityToken::from_entity_type_and_token(
    request.entity_type, &request.entity_token);

  let query_result = create_user_bookmark(CreateUserBookmarkArgs {
    entity_token: &entity_token,
    user_token: &user_session.user_token_typed,
    mysql_executor: &mut *mysql_connection,
    phantom: Default::default(),
  }).await;

  let user_bookmark_token = match query_result {
    Ok(token) => token,
    Err(err) => {
      warn!("error inserting user_bookmark: {:?}", err);
      return Err(CreateUserBookmarkError::ServerError);
    }
  };

  let response = CreateUserBookmarkSuccessResponse {
    success: true,
    user_bookmark_token,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| CreateUserBookmarkError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
