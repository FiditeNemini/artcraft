use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn create_voice_handler() -> HttpResponse {
  // Implementation for creating a voice
  HttpResponse::Ok().json("Voice created successfully")
}