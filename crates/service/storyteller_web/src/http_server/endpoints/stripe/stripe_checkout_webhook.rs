use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use actix_web::{web, HttpResponse, HttpRequest};
use chrono::{DateTime, Utc};
use crate::utils::session_checker::SessionChecker;
use http_server_common::request::get_request_header_optional::get_request_header_optional;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use http_server_common::util::timer::MultiBenchmarkingTimer;
use log::warn;
use reusable_types::entity_visibility::EntityVisibility;
use sqlx::MySqlPool;
use std::fmt;
use actix_web::error::UrlencodedError::ContentType;

// TODO: This is duplicated in query_user_CreateCheckoutSession
// TODO: This handler has embedded queries.

#[derive(Serialize)]
pub struct CreateCheckoutSessionSuccessResponse {
  pub success: bool,
}

#[derive(Debug, Serialize)]
pub enum CreateCheckoutSessionError {
  ServerError,
}

impl ResponseError for CreateCheckoutSessionError {
  fn status_code(&self) -> StatusCode {
    match *self {
      CreateCheckoutSessionError::ServerError=> StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for CreateCheckoutSessionError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn create_checkout_session_handler(
  http_request: HttpRequest,
  mysql_pool: web::Data<MySqlPool>,
) -> Result<HttpResponse, CreateCheckoutSessionError>
{

  let stripe_publishable_key = "pk_test_51KZvWXEU5se17Mekx6e0gw32ovDF78k2eeaGctLIs8oQVxN6DerEp1BDqh6gLMYKli4VsTZoVGHoxq5RmwKMlxtP00r59UEEad";
  let stripe_secret_key = "sk_test_51KZvWXEU5se17Mek11ZdnWr4frnyw7tWOPuvl3pRzL290zvkT6KqcbGUl3fcvc3hA8oH6lWXz2kGWXXUlNcCuDxB003uVT9JX0";

  let product_fakeyou_basic_id = "prod_MMxi2J5y69VPbO";


  let response = CreateCheckoutSessionSuccessResponse {
    success: true,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| CreateCheckoutSessionError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
