use actix_http::http::StatusCode;
use actix_web::{HttpResponse, HttpRequest, Responder, get, web, HttpMessage};
use log::info;
use actix_http::cookie::Cookie;
use crate::server_state::ServerState;
use std::sync::Arc;
use actix_web::web::Query;

const ALPHA_COOKIE_NAME : &'static str = "enable-alpha";
const CONTENT_TYPE : &'static str = "text/html; charset=utf-8";

#[derive(Deserialize)]
struct QueryFields {
  enable: Option<bool>,
}

#[get("/alpha")]
pub async fn enable_alpha(http_request: HttpRequest,
                          query: Query<QueryFields>,
                          server_state: web::Data<Arc<ServerState>>) -> impl Responder
{
  info!("GET /alpha");

  let cookie = Cookie::build(ALPHA_COOKIE_NAME, "true")
    .domain(&server_state.env_config.cookie_domain)
    .secure(server_state.env_config.cookie_secure) // HTTPS-only
    .http_only(false) // This is meant to be exposed to Javascript!
    .permanent()
    .finish();

  match query.enable {
    None => {
      let cookie_exists = http_request.cookie(ALPHA_COOKIE_NAME).is_some();

      HttpResponse::build(StatusCode::OK)
        .content_type(CONTENT_TYPE)
        .body(format!("<h1>use ?enable={{true, false}}; current `{}` cookie state = {}</h1>",
                      ALPHA_COOKIE_NAME, cookie_exists))
    }
    Some(true) => {
      HttpResponse::build(StatusCode::OK)
        .content_type(CONTENT_TYPE)
        .cookie(cookie)
        .body(format!("<h1>?enable=true; setting `{}` cookie</h1>", ALPHA_COOKIE_NAME))
    }
    Some(false) => {
      HttpResponse::build(StatusCode::OK)
        .content_type(CONTENT_TYPE)
        .del_cookie(&cookie)
        .body(format!("<h1>?enable=false; unsetting `{}` mode cookie</h1>", ALPHA_COOKIE_NAME))
    }
  }
}
