use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, Responder, web};
use crate::ServerState;
use crate::http_server::endpoints::flags::design_refresh_flag::build_design_refresh_cookie::build_design_refresh_cookie;
use crate::http_server::endpoints::flags::get_cookie_domain::get_set_cookie_domain;
use std::sync::Arc;

pub async fn enable_design_refresh_flag_handler(
  http_request: HttpRequest,
  server_state: web::Data<Arc<ServerState>>
) -> impl Responder
{
  let maybe_cookie_domain = get_set_cookie_domain(&http_request);

  let mut cookie_builder = build_design_refresh_cookie(&server_state, true);

  if let Some(cookie_domain) = maybe_cookie_domain {
    cookie_builder = cookie_builder.domain(cookie_domain);
  }

  let cookie = cookie_builder.finish();

  HttpResponse::build(StatusCode::OK)
      .content_type("text/plain")
      .cookie(cookie)
      .body("cookie enabled")
}
