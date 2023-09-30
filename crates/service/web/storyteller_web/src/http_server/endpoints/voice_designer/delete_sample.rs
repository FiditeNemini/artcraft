

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};


pub async fn delete_sample() -> HttpResponse {
    // Implementation for deleting a sample
    HttpResponse::Ok().json("Sample deleted successfully")
  }