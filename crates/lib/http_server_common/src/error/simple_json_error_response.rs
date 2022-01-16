use actix_web::http::{StatusCode, header};
use actix_web::{HttpResponse, HttpResponseBuilder};

/// Convert a string and status code to a JSON error response.
pub fn simple_json_error_response(
  error_reason: &str,
  status_code: StatusCode,
) -> HttpResponse {

  let response = SimpleGenericJsonError {
    success: false,
    error_reason : error_reason.to_string(),
  };

  let body = match serde_json::to_string(&response) {
    Ok(json) => json,
    Err(_) => "{}".to_string(),
  };

  HttpResponseBuilder::new(status_code)
      .content_type("application/json")
      .body(body)
}

#[derive(Serialize)]
struct SimpleGenericJsonError {
  pub success: bool,
  pub error_reason: String,
}
