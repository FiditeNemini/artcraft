

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn list_user_models() -> HttpResponse {
  // Implementation for listing models created by a particular user
  HttpResponse::Ok().json("List of models created by the user")
}
