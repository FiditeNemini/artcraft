

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn upload_sample() -> HttpResponse {
  // Implementation for uploading a sample
  HttpResponse::Ok().json("Sample uploaded successfully")
}