use actix_web::{Responder, web, HttpResponse, error};
use derive_more::{Display, Error};
use actix_web::dev::HttpResponseBuilder;
use actix_web::http::StatusCode;
use actix_http::http::header;
use actix_http::Error;
use actix_web::error::ResponseError;
use crate::endpoints::users::create_account::CreateAccountError::BadInput;

#[derive(Deserialize)]
pub struct CreateAccountRequest {
  pub username: String,
  pub password: String,
  pub password_confirmation: String,
}

#[derive(Serialize)]
pub struct CreateAccountResponse {
  pub success: bool,

}

#[derive(Debug, Display, Error)]
pub enum CreateAccountResponseError {
  #[display(fmt = "internal error")]
  InternalError,

  #[display(fmt = "bad request")]
  BadClientData,

  #[display(fmt = "timeout")]
  Timeout,
}


#[derive(Debug, Display)]
pub enum CreateAccountError {
  BadInput(String),
}

impl ResponseError for CreateAccountError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateAccountError::BadInput(_) => StatusCode::BAD_REQUEST,
    }
  }

  fn error_response(&self) -> HttpResponse {
    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "text/html; charset=utf-8")
      .body("bad")
  }
}


impl ResponseError for CreateAccountResponseError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateAccountResponseError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
      CreateAccountResponseError::BadClientData => StatusCode::BAD_REQUEST,
      CreateAccountResponseError::Timeout => StatusCode::GATEWAY_TIMEOUT,
    }
  }

  fn error_response(&self) -> HttpResponse {
    HttpResponseBuilder::new(self.status_code())
      .set_header(header::CONTENT_TYPE, "text/html; charset=utf-8")
      .body(self.to_string())
  }
}


pub async fn create_account_handler(request: web::Json<CreateAccountRequest>)
  -> Result<HttpResponse, CreateAccountError>
{
  if request.username.len() < 3 {
    return Err(CreateAccountError::BadInput("username is too short".to_string()));
  }

  /*let record_id = sqlx::query!(
        r#"
INSERT INTO badges ( slug, title, description, image_url )
VALUES ( ?, ?, ?, ? )
        "#,
        self.slug,
        self.title,
        self.description,
        self.image_url,
    )
    .execute(pool)
    .await?
    .last_insert_id();

  Ok(record_id)*/


  /*Ok(web::Json())*/

  if true {
    //return Err(error::ErrorBadRequest(CreateAccountResponse { success: false } ));
    //return Err(CreateAccountResponseError::UsernameExists("foo".to_string()));
  }

  // .map_err(error::ErrorInternalServerError)?;
  // error::ErrorBadRequest(msg)
  let response = CreateAccountResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
    .map_err(|e| BadInput("".to_string()))?;

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body(body))
}