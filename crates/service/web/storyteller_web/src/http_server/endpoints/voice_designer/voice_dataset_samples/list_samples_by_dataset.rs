

use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;

use log::{info, warn};

pub async fn list_samples_by_dataset_handler(data_set_token: web::Path<String>) -> HttpResponse {
  // Implementation for listing samples for a dataset
  HttpResponse::Ok().json(format!("List of samples for dataset {}", data_set_token))
}
