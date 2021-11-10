use actix_http::http::{StatusCode, header};
use actix_web::HttpResponse;
use serde::Serialize;

#[cfg(feature = "actix-new")]
use actix_web::error::ResponseError;

#[cfg(feature = "actix-new")]
use actix_web::HttpResponseBuilder;

#[cfg(not(feature = "actix-new"))]
use actix_http::ResponseError;

#[cfg(not(feature = "actix-new"))]
use actix_web::dev::HttpResponseBuilder;

/// Turn error responses into JSON HTTP responses
pub fn serialize_as_json_error<T>(
  error_payload: &T,
) -> HttpResponse
  where T: ?Sized + Serialize + ResponseError,
{
  let body = match serde_json::to_string(error_payload) {
    Ok(json) => json,
    Err(_) => "{}".to_string(),
  };

  HttpResponseBuilder::new(error_payload.status_code())
      .set_header(header::CONTENT_TYPE, "application/json")
      .body(body)
}
