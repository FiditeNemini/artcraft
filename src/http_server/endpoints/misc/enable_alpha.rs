use actix_http::cookie::Cookie;
use actix_http::http::StatusCode;
use actix_web::web::Query;
use actix_web::{HttpResponse, HttpRequest, Responder, get, web, HttpMessage};
use crate::server_state::ServerState;
use log::info;
use std::sync::Arc;

const ALPHA_COOKIE_NAME : &'static str = "enable-alpha";
const CONTENT_TYPE : &'static str = "text/html; charset=utf-8";

const ENABLE_LINK : &'static str = "<a href=\"/alpha?enable=true\">enable</a>";
const DISABLE_LINK : &'static str = "<a href=\"/alpha?enable=false\">disable</a>";
const STATUS_LINK : &'static str = "<a href=\"/alpha\">status</a>";


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
        .body(format!("<h1>Alpha mode.</h1><h2>Current `{}` cookie state = {}</h2> {} | {} | {}",
                      ALPHA_COOKIE_NAME, cookie_exists, ENABLE_LINK, DISABLE_LINK, STATUS_LINK))
    }
    Some(true) => {
      HttpResponse::build(StatusCode::OK)
        .content_type(CONTENT_TYPE)
        .cookie(cookie)
        .body(format!("<h1>Alpha mode</h1><h2>setting `{}` cookie</h2> {} | {} | {}",
                      ALPHA_COOKIE_NAME, ENABLE_LINK, DISABLE_LINK, STATUS_LINK))
    }
    Some(false) => {
      HttpResponse::build(StatusCode::OK)
        .content_type(CONTENT_TYPE)
        .del_cookie(&cookie)
        .body(format!("<h1>Alpha mode</h1><h2>unsetting `{}` cookie</h2> {} | {} | {}",
                      ALPHA_COOKIE_NAME, ENABLE_LINK, DISABLE_LINK, STATUS_LINK))
    }
  }
}
