use actix_web::http::StatusCode;
use actix_web::{
  HttpRequest,
  HttpResponse,
  get,
};

#[get("/readiness")]
pub async fn get_readiness(_request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /readiness");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Ready"))
}
