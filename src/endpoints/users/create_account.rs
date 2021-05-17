use actix_web::{Responder, web, HttpResponse};
use derive_more::{Display, Error};
use actix_web::dev::HttpResponseBuilder;
use actix_web::http::StatusCode;
use actix_http::http::header;
use actix_http::Error;

#[derive(Deserialize)]
pub struct CreateAccountRequest {
  pub username: String,
  pub password: String,
  pub password_verification: String,
}

#[derive(Serialize)]
pub struct CreateAccountResponse {
  pub success: bool,

}

#[derive(Debug, Display, Error)]
enum CreateAccountResponseError {
  #[display(fmt = "internal error")]
  InternalError,

  #[display(fmt = "bad request")]
  BadClientData,

  #[display(fmt = "timeout")]
  Timeout,
}

impl actix_web::error::ResponseError for CreateAccountResponseError {
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

//request: web::Json<CreateAccountRequest>
pub async fn create_account_handler() -> Result<HttpResponse, Error> {

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

  /*if true {
    return Err(CreateAccountResponse {
      success: false,
    });
  }*/

  /*Ok(web::Json())*/

  let response = CreateAccountResponse {
    success: true,
  };

  Ok(HttpResponse::Ok()
    .content_type("application/json")
    .body("foo"))
}