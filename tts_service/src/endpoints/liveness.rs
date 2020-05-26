use actix_web::http::StatusCode;
use actix_web::{
  HttpRequest,
  HttpResponse,
  get,
};

#[get("/liveness")]
pub async fn get_liveness(_request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /liveness");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Live"))
}
