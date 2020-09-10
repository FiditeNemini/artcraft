use actix_http::ResponseBuilder;
use actix_web::http::{header, StatusCode};
use actix_web::{HttpResponse, ResponseError};
use std::fmt::{Formatter, Display};
use std::fmt;

#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  pub speaker: String,

  /// Raw text to be spoken
  pub text: String,

  /// Retry attempt.
  /// The first request is "0", and all subsequent requests are incremented.
  /// Subsequent requests do not trigger the rate limiter.
  #[serde(default)]
  pub retry_attempt_number: u8,

  /// Admin/debug requests get to skip the rate limiter.
  #[serde(default)]
  pub skip_rate_limiter: bool,
}

#[derive(Serialize,Debug)]
pub struct SpeakError {
  /// The type of error
  pub error_type: ErrorType,
  /// Description of the error
  pub description: String,
}

#[derive(Debug,Serialize,Copy,Clone)]
pub enum ErrorType {
  BadRequest,
  InputLength,
  ModelStillLoading,
  NoSuchSpeaker,
  RateLimited,
}

impl SpeakError {
  pub fn rate_limited() -> Self {
    Self {
      error_type: ErrorType::RateLimited,
      description: "You're making requests too quickly. Slow down a bit.".to_string(),
    }
  }

  pub fn unknown_speaker() -> Self {
    Self {
      error_type: ErrorType::NoSuchSpeaker,
      description: "That speaker doesn't exist!".to_string(),
    }
  }

  pub fn generic_bad_request(error_message: &str) -> Self {
    Self {
      error_type: ErrorType::BadRequest,
      description: error_message.to_string(),
    }
  }
}
impl Display for SpeakError {
  fn fmt(&self, f: &mut Formatter) -> fmt::Result {
    let error_json = serde_json::to_string(self).expect("Deserialization broken");
    write!(f, "{}", error_json)
  }
}

impl ResponseError for SpeakError {
  fn error_response(&self) -> HttpResponse {
    let error_json = serde_json::to_string(self).expect("Deserialization broken");
    ResponseBuilder::new(self.status_code())
        .set_header(header::CONTENT_TYPE, "application/json")
        .body(error_json)
  }

  fn status_code(&self) -> StatusCode {
    match self.error_type {
      ErrorType::BadRequest => StatusCode::BAD_REQUEST,
      ErrorType::InputLength => StatusCode::BAD_REQUEST,
      ErrorType::ModelStillLoading => StatusCode::TOO_MANY_REQUESTS,
      ErrorType::NoSuchSpeaker=> StatusCode::NOT_FOUND,
      ErrorType::RateLimited => StatusCode::TOO_MANY_REQUESTS,
    }
  }
}
