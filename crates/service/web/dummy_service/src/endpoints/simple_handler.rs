use actix_http::StatusCode;
use actix_web::HttpResponse;

pub async fn simple_handler() -> HttpResponse {
  HttpResponse::build(StatusCode::OK)
      .content_type("application/json; charset=utf-8")
      .body("{\"success\": true}")
}

