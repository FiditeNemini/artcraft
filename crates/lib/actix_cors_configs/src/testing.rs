use actix_cors::Cors;
use actix_http::body::{BoxBody, EitherBody};
use actix_http::StatusCode;
use actix_web::dev::{ServiceResponse, Transform};
use actix_web::test;
use actix_web::test::TestRequest;
use speculoos::asserting;

pub (crate) async fn assert_origin_ok(cors: &Cors, hostname: &str) {
  let response = make_test_request(cors, hostname).await;
  asserting(&format!("Hostname {} is valid", hostname))
      .that(&response.status())
      .is_equal_to(StatusCode::OK);
}

pub (crate) async fn assert_origin_invalid(cors: &Cors, hostname: &str) {
  let response = make_test_request(cors, hostname).await;
  asserting(&format!("Hostname {} is invalid", hostname))
      .that(&response.status())
      .is_equal_to(StatusCode::BAD_REQUEST);
}

async fn make_test_request(cors: &Cors, hostname: &str) -> ServiceResponse<EitherBody<BoxBody>> {
  let cors= cors.new_transform(test::ok_service())
      .await
      .unwrap();

  let request = TestRequest::default()
      .insert_header(("Origin", hostname))
      .to_srv_request();

  test::call_service(&cors, request).await
}
