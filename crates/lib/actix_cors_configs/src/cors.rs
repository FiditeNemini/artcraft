use actix_cors::Cors;
use log::info;

use reusable_types::server_environment::ServerEnvironment;
use crate::configs::development_only::add_development_only;

use crate::configs::fakeyou::{add_fakeyou, add_fakeyou_dev_proxy};
use crate::configs::gottagofast::add_gotta_go_fast_test_branches;
use crate::configs::legacy::{add_legacy_storyteller_stream, add_legacy_trumped, add_legacy_vocodes, add_power_stream};
use crate::configs::storyteller::{add_storyteller, add_storyteller_dev_proxy};

/// Return cors config for FakeYou / Vocodes / OBS / local development
pub fn build_cors_config(server_environment: ServerEnvironment) -> Cors {
  let is_production = server_environment.is_deployed_in_production();

  info!("Building CORS for environment: {:?}", server_environment);

  do_build_cors_config(is_production)
}

/// Return cors config for FakeYou / Vocodes / OBS / local development
pub fn build_production_cors_config() -> Cors {
  const IS_PRODUCTION : bool = true;
  do_build_cors_config(IS_PRODUCTION)
}

fn do_build_cors_config(is_production: bool) -> Cors {
  let mut cors = Cors::default();

  info!("Building CORS for production: {}", is_production);

  // Current product
  cors = add_fakeyou(cors, is_production);
  cors = add_fakeyou_dev_proxy(cors, is_production);
  cors = add_storyteller(cors, is_production);
  cors = add_storyteller_dev_proxy(cors, is_production);
  cors = add_gotta_go_fast_test_branches(cors, is_production);

  // Legacy
  cors = add_legacy_trumped(cors, is_production);
  cors = add_power_stream(cors, is_production);
  cors = add_legacy_storyteller_stream(cors, is_production);
  cors = add_legacy_vocodes(cors, is_production);

  // Development
  if !is_production {
    cors = add_development_only(cors);
  }

  // Remaining setup
  cors.allowed_methods(vec!["GET", "POST", "OPTIONS", "DELETE"])
      .supports_credentials()
      .allowed_headers(vec![
        actix_http::header::ACCEPT,
        actix_http::header::ACCESS_CONTROL_ALLOW_ORIGIN, // Tabulator Ajax
        actix_http::header::CONTENT_TYPE,
        actix_http::header::ACCESS_CONTROL_ALLOW_CREDENTIALS, // https://stackoverflow.com/a/46412839
        actix_http::header::HeaderName::from_static("x-requested-with") // Tabulator Ajax sends
      ])
      .max_age(3600)
}

#[cfg(test)]
mod tests {
  use actix_cors::Cors;
  use actix_http::body::{BoxBody, EitherBody};
  use actix_web::dev::{ServiceResponse, Transform};
  use actix_web::http::StatusCode;
  use actix_web::test;
  use actix_web::test::TestRequest;
  use speculoos::asserting;

  use reusable_types::server_environment::ServerEnvironment;

  use super::build_cors_config;

  async fn make_test_request(cors: &Cors, hostname: &str) -> ServiceResponse<EitherBody<BoxBody>> {
    let cors= cors.new_transform(test::ok_service())
        .await
        .unwrap();

    let request = TestRequest::default()
        .insert_header(("Origin", hostname))
        .to_srv_request();

    test::call_service(&cors, request).await
  }

  async fn assert_origin_ok(cors: &Cors, hostname: &str) {
    let response = make_test_request(cors, hostname).await;
    asserting(&format!("Hostname {} is valid", hostname))
        .that(&response.status())
        .is_equal_to(StatusCode::OK);
  }

  async fn assert_origin_invalid(cors: &Cors, hostname: &str) {
    let response = make_test_request(cors, hostname).await;
    asserting(&format!("Hostname {} is invalid", hostname))
        .that(&response.status())
        .is_equal_to(StatusCode::BAD_REQUEST);
  }

  #[actix_rt::test]
  async fn test_fakeyou_production() {
    let production_cors = build_cors_config(ServerEnvironment::Production);

    // Valid Origin
    assert_origin_ok(&production_cors, "https://fakeyou.com").await;
    assert_origin_ok(&production_cors, "https://api.fakeyou.com").await;
    assert_origin_ok(&production_cors, "https://staging.fakeyou.com").await;

    // Invalid Origin
    assert_origin_invalid(&production_cors, "https://fake.fakeyou.com").await;
    assert_origin_invalid(&production_cors, "https://jungle.horse").await;
    assert_origin_invalid(&production_cors, "http://localhost:54321").await;
  }

  #[actix_rt::test]
  async fn test_fakeyou_development() {
    let development_cors = build_cors_config(ServerEnvironment::Development);

    // Valid Origin
    assert_origin_ok(&development_cors, "https://dev.fakeyou.com").await;
    assert_origin_ok(&development_cors, "http://localhost:54321").await;

    // Invalid Origin
    assert_origin_invalid(&development_cors, "https://fakeyou.com").await;
    assert_origin_invalid(&development_cors, "https://api.fakeyou.com").await;
    assert_origin_invalid(&development_cors, "https://staging.fakeyou.com").await;
  }

  #[actix_rt::test]
  async fn test_storyteller_production() {
    let production_cors = build_cors_config(ServerEnvironment::Production);

    // Valid Origin
    assert_origin_ok(&production_cors, "https://storyteller.ai").await;
    assert_origin_ok(&production_cors, "https://api.storyteller.ai").await;
    assert_origin_ok(&production_cors, "https://staging.storyteller.ai").await;

    // Invalid Origin
    assert_origin_invalid(&production_cors, "https://dev.storyteller.ai").await;
    assert_origin_invalid(&production_cors, "http://dev.storyteller.ai").await;
  }

  #[actix_rt::test]
  async fn test_storyteller_development() {
    let development_cors = build_cors_config(ServerEnvironment::Development);

    // Valid Origin
    assert_origin_ok(&development_cors, "https://dev.storyteller.ai").await;
    assert_origin_ok(&development_cors, "http://localhost:54321").await;

    // Invalid Origin
    assert_origin_invalid(&development_cors, "https://storyteller.ai").await;
    assert_origin_invalid(&development_cors, "https://staging.storyteller.ai").await;
  }
}
