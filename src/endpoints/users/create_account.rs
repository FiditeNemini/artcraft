use actix_http::Error;
use actix_http::http::header;
use actix_web::dev::HttpResponseBuilder;
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::{Responder, web, HttpResponse, error};
use crate::endpoints::users::create_account::CreateAccountError::BadInput;
use derive_more::{Display, Error};
use log::{info, warn, log};
use crate::server_state::ServerState;

const NEW_USER_ROLE: &'static str = "new-user";

#[derive(Deserialize)]
pub struct CreateAccountRequest {
  pub username: String,
  pub password: String,
  pub password_confirmation: String,
  pub email_address: String,
}

#[derive(Serialize)]
pub struct CreateAccountSuccessResponse {
  pub success: bool,
}

#[derive(Serialize)]
pub struct ErrorResponse {
  pub success: bool,
  pub error_reason: String,
}

#[derive(Debug, Display)]
pub enum CreateAccountError {
  BadInput(String),
  ServerError,
}

impl ResponseError for CreateAccountError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateAccountError::BadInput(_) => StatusCode::BAD_REQUEST,
      CreateAccountError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      BadInput(reason) => reason.to_string(),
      CreateAccountError::ServerError => "server error".to_string(),
    };

    let response = ErrorResponse {
      success: false,
      error_reason,
    };

    let body = match serde_json::to_string(&response) {
      Ok(json) => json,
      Err(_) => "{}".to_string(),
    };

    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "application/json")
      .body(body)
  }
}

pub async fn create_account_handler(
  request: web::Json<CreateAccountRequest>,
  server_state: web::Data<ServerState>) -> Result<HttpResponse, CreateAccountError>
{
  if request.username.len() < 3 {
    return Err(CreateAccountError::BadInput("username is too short".to_string()));
  }

  if request.password.len() < 6 {
    return Err(CreateAccountError::BadInput("password is too short".to_string()));
  }

  if request.password != request.password_confirmation {
    return Err(CreateAccountError::BadInput("passwords do not match".to_string()));
  }

  if !request.email_address.contains("@") {
    return Err(CreateAccountError::BadInput("invalid email address".to_string()));
  }

  let token = "token";
  let password_hash = "temp";
  let profile_markdown = "";
  let profile_rendered_html = "";
  let ip_address = "1.1.1.1";

  let record_id = sqlx::query!(
        r#"
INSERT INTO users (
  token,
  username,
  display_name,
  email_address,
  profile_markdown,
  profile_rendered_html,
  user_role_slug,
  password_hash,
  ip_address_creation,
  ip_address_last_login,
  ip_address_last_update
)
VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
        "#,
        token.to_string(),
        request.username.to_string(),
        request.username.to_string(),
        request.email_address.to_string(),
        profile_markdown,
        profile_rendered_html,
        NEW_USER_ROLE,
        password_hash,
        ip_address.to_string(),
        ip_address.to_string(),
        ip_address.to_string(),
    )
    .execute(&server_state.mysql_pool)
    .await
    .map_err(|_| CreateAccountError::ServerError)?
    .last_insert_id();

  info!("new user id: {}", record_id);

  //Ok(record_id)
  /*Ok(web::Json())*/

  if true {
    //return Err(error::ErrorBadRequest(CreateAccountResponse { success: false } ));
    //return Err(CreateAccountResponseError::UsernameExists("foo".to_string()));
  }

  // .map_err(error::ErrorInternalServerError)?;
  // error::ErrorBadRequest(msg)
  let response = CreateAccountSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| BadInput("".to_string()))?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}