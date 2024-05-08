use actix_multipart::MultipartError;
use actix_web::HttpRequest;
use log::error;
use actix_web::Error;

pub fn handle_multipart_error(err: MultipartError, req: &HttpRequest) -> Error {
  error!("Multipart error: {}", err);
  Error::from(err)
}
