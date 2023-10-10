

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};



pub async fn list_available_voices() -> HttpResponse {
  // Implementation for listing available voices (paginated)
  HttpResponse::Ok().json("List of available voices")
}
