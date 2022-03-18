use actix_http::header;
use actix_http::http::StatusCode;
use actix_web::cookie::Cookie;
use actix_web::web::Query;
use actix_web::{HttpResponse, HttpRequest, Responder, get, web, HttpMessage};
use crate::http_server::endpoints::investor_demo::default_redirect::{DEFAULT_INVESTOR_REDIRECT, redirect_is_allowed};
use crate::http_server::endpoints::investor_demo::demo_cookie::STORYTELLER_DEMO_COOKIE_NAME;
use crate::server_state::ServerState;
use hyper::header::LOCATION;
use log::info;
use std::ops::Deref;
use std::sync::Arc;
use time::OffsetDateTime;

#[derive(Deserialize)]
pub struct QueryFields {
  redirect_to: Option<String>,
}

pub async fn disable_demo_mode_handler(
  http_request: HttpRequest,
  query: Query<QueryFields>,
  server_state: web::Data<Arc<ServerState>>
) -> impl Responder
{
  let unsafe_redirect = query.redirect_to
      .map(|r| r.clone())
      .unwrap_or(DEFAULT_INVESTOR_REDIRECT.to_string());

  let redirect_allowed = redirect_is_allowed(&unsafe_redirect);

  let safe_redirect = if redirect_allowed {
    unsafe_redirect
  } else {
    DEFAULT_INVESTOR_REDIRECT.to_string()
  };

  // Kill the cookie.
  let cookie = Cookie::build(STORYTELLER_DEMO_COOKIE_NAME, "")
      .secure(server_state.env_config.cookie_secure) // HTTPS-only
      .expires(OffsetDateTime::unix_epoch())
      .http_only(false) // This is meant to be exposed to Javascript!
      .permanent()
      .finish();

  HttpResponse::build(StatusCode::FOUND)
      .append_header((header::LOCATION, url.to_string()))
      .del_cookie(&cookie)
}
