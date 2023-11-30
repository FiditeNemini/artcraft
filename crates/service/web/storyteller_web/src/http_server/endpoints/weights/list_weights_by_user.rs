use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use chrono::{DateTime, Utc};
use log::warn;

use enums::common::visibility::Visibility;
use mysql_queries::queries::model_weights::list_weights_by_user::list_weights_by_creator_username;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::http_server::common_responses::user_details_lite::UserDetailsLight;
use crate::server_state::ServerState;

#[derive(Serialize, Clone)]
pub struct Weight {
  weight_token: ModelWeightToken,
  title: String,

  creator: UserDetailsLight,

  creator_set_visibility: Visibility,

  created_at: DateTime<Utc>,
  updated_at: DateTime<Utc>,
}


#[derive(Serialize)]
pub struct ListWeightsByUserSuccessResponse {
  pub success: bool,
  pub weights: Vec<Weight>,
}

#[derive(Deserialize)]
pub struct ListWeightsByUserPathInfo {
  username: String,
}

#[derive(Debug)]
pub enum ListWeightsByUserError {
  NotAuthorized,
  ServerError,
}

impl fmt::Display for ListWeightsByUserError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

impl ResponseError for ListWeightsByUserError {
  fn status_code(&self) -> StatusCode {
    match *self {
      ListWeightsByUserError::NotAuthorized => StatusCode::UNAUTHORIZED,
      ListWeightsByUserError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }
}

pub async fn list_weights_by_user_handler(
  http_request: HttpRequest,
  path: Path<ListWeightsByUserPathInfo>,
  server_state: web::Data<Arc<ServerState>>
) -> Result<HttpResponse, ListWeightsByUserError> {

  let maybe_user_session = server_state
      .session_checker
      .maybe_get_user_session(&http_request, &server_state.mysql_pool)
      .await
      .map_err(|e| {
        warn!("Session checker error: {:?}", e);
        ListWeightsByUserError::ServerError
      })?;

  let user_session = match maybe_user_session {
    Some(session) => session,
    None => {
      warn!("not logged in");
      return Err(ListWeightsByUserError::NotAuthorized);
    }
  };

  let username = path.username.as_ref();
  let creator_user_token = user_session.user_token.clone();
  let is_mod = user_session.can_ban_users;

  let query_results = list_weights_by_creator_username(
    &server_state.mysql_pool,
    &username,
    is_mod,
  ).await.map_err(|e| {
    warn!("Error querying for weights: {:?}", e);
    ListWeightsByUserError::ServerError
  });
  let weights = match query_results {
    Ok(weights) => weights,
    Err(e) => {
      warn!("Error querying for weights: {:?}", e);


      return Err(ListWeightsByUserError::ServerError);
    }
  };
  
  let weights = weights.into_iter().map(|weight| {
    Weight {
      weight_token: weight.token,
      title: weight.title,
      creator: UserDetailsLight::from_db_fields(
        &weight.creator_user_token,
        &weight.creator_username,
        &weight.creator_display_name,
        &weight.creator_email_gravatar_hash,
      ),
      creator_set_visibility: weight.creator_set_visibility,
      created_at: weight.created_at,
      updated_at: weight.updated_at,
    }
  }).collect();
  
  let response = ListWeightsByUserSuccessResponse {
    success: true,
    weights,
  };
  
  let body = serde_json::to_string(&response)
      .map_err(|e| ListWeightsByUserError::ServerError)?;
  
  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}