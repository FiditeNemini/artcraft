use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use actix_web::web::Path;
use log::{error, log, warn};

use http_server_common::request::get_request_ip::get_request_ip;
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;

pub async fn create_dataset() -> HttpResponse {
    // Implementation for creating a dataset
    HttpResponse::Ok().json("Dataset created successfully")
  }
  