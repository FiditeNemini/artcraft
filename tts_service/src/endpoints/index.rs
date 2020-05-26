use actix_web::http::StatusCode;
use actix_web::{
  HttpRequest,
  HttpResponse,
  get,
};

#[get("/")]
pub async fn get_root(_request: HttpRequest) -> std::io::Result<HttpResponse> {
  println!("GET /");
  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("text/html; charset=utf-8")
      .body("Hello World"))
}
