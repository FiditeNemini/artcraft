use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use log::{error, log, warn};
use enums::by_table::audit_logs::audit_log_entity_action::AuditLogEntityAction::Delete;

use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use mysql_queries::queries::model_weights::delete_weights::{delete_weights_as_user,delete_weights_as_mod,undelete_weights_as_user,undelete_weights_as_mod};
use mysql_queries::queries::model_weights::get_weight::get_weight_by_token;

use tokens::tokens::model_weights::ModelWeightToken;

use crate::http_server::web_utils::response_success_helpers::simple_json_success;
use crate::server_state::ServerState;
use crate::util::delete_role_disambiguation::{delete_role_disambiguation, DeleteRole};

use enums::common::visibility::Visibility;
use tokens::tokens::users::UserToken;


#[derive(Deserialize)]
pub struct DeleteWeightRequest {
  set_delete: bool,
  as_mod: bool,
  weight_token: String, 
}

// =============== Error Response ===============

#[derive(Debug, Serialize)]
pub enum DeleteWeightError {
  BadInput(String),
  NotFound,
  NotAuthorized,
  ServerError,
}

impl ResponseError for DeleteWeightError {
  fn status_code(&self) -> StatusCode {
    match *self {
      DeleteWeightError::BadInput(_) => StatusCode::BAD_REQUEST,
      DeleteWeightError::NotFound => StatusCode::NOT_FOUND,
      DeleteWeightError::NotAuthorized => StatusCode::UNAUTHORIZED,
      DeleteWeightError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for DeleteWeightError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn delete_weight_handler(
    http_request: HttpRequest,
    path: Path<DeleteWeightRequest>,
    server_state: web::Data<Arc<ServerState>>
  ) -> Result<HttpResponse, DeleteWeightError>{
    let maybe_user_session = server_state
        .session_checker
        .maybe_get_user_session(&http_request, &server_state.mysql_pool)
        .await
        .map_err(|e| {
          warn!("Session checker error: {:?}", e);
          DeleteWeightError::ServerError
        })?;
  
    let user_session = match maybe_user_session {
      Some(session) => session,
      None => {
        warn!("not logged in");
        return Err(DeleteWeightError::NotAuthorized);
      }
    };
  
    let weight_token = path.weight_token.clone();
    let is_mod = user_session.can_ban_users;
  
    let weight_lookup_result = get_weight_by_token(
      &ModelWeightToken::new(weight_token.clone()),
      is_mod,
      &server_state.mysql_pool,
    ).await;
  
    let weight = match weight_lookup_result {
      Ok(Some(weight)) => weight,
      Ok(None) => {
        warn!("Weight not found: {:?}", weight_token);
        return Err(DeleteWeightError::NotFound);
      },
      Err(err) => {
        warn!("Error looking up weight: {:?}", err);
        return Err(DeleteWeightError::ServerError);
      }
    };
  
    let is_creator = weight.creator_user_token.to_string() == user_session.user_token;
  
    if !is_creator && !is_mod {
      warn!("user is not allowed to delete this weight: {}", user_session.user_token);
      return Err(DeleteWeightError::NotAuthorized);
    }
  
    let delete_role = delete_role_disambiguation(is_mod, is_creator, Some(path.as_mod));
  
    let query_result = if path.set_delete {
      match delete_role {
        DeleteRole::ErrorDoNotDelete => {
          warn!("user is not allowed to delete weights: {}", user_session.user_token);
          return Err(DeleteWeightError::NotAuthorized);
        }
        DeleteRole::AsUser => {
          delete_weights_as_user(
            &ModelWeightToken::new_from_str(&path.weight_token),
            &server_state.mysql_pool
          ).await
        }
        DeleteRole::AsMod => {
          delete_weights_as_mod(
            &ModelWeightToken::new_from_str(&path.weight_token),
            &server_state.mysql_pool
          ).await
        }
      }
    } else {
      match delete_role {
        DeleteRole::ErrorDoNotDelete => {
          warn!("user is not allowed to undelete weights: {}", user_session.user_token);
          return Err(DeleteWeightError::NotAuthorized);
        }
        DeleteRole::AsUser => {
          undelete_weights_as_user(
           &ModelWeightToken::new_from_str(&path.weight_token),
            &server_state.mysql_pool
          ).await
        }
        DeleteRole::AsMod => {
          undelete_weights_as_user(
           &ModelWeightToken::new_from_str(&path.weight_token),
            &server_state.mysql_pool
          ).await
        }
      }
    };
  
    match query_result {
      Ok(_) => {},
      Err(err) => {
        warn!("Update weight mod approval status DB error: {:?}", err);
        return Err(DeleteWeightError::ServerError);
      }
    };
  
    Ok(simple_json_success())
  }