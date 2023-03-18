use actix_web::HttpRequest;
use actix_web::http::header::HOST;
use crate::request::get_request_header_optional::get_request_header_optional;

/// Get the request host
pub fn get_request_host(request: &HttpRequest) -> Option<String> {
  get_request_header_optional(request, HOST.as_str())
}
