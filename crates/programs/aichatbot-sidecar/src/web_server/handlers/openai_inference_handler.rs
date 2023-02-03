use std::sync::Arc;
use actix_http::StatusCode;
use actix_web::{HttpRequest, HttpResponse, ResponseError, web};
use async_openai::Client;
use async_openai::types::CreateCompletionRequestArgs;
use log::{error, info};
use http_server_common::response::serialize_as_json_error::serialize_as_json_error;
use crate::shared_state::control_state::ControlState;

#[derive(Serialize)]
pub struct OpenAiInferenceResponse {
  pub success: bool,
  pub openai_results: String,
}

#[derive(Debug, Serialize)]
pub enum OpenAiInferenceError {
  ServerError,
}

impl ResponseError for OpenAiInferenceError {
  fn status_code(&self) -> StatusCode {
    match *self {
      OpenAiInferenceError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    serialize_as_json_error(self)
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl std::fmt::Display for OpenAiInferenceError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{:?}", self)
  }
}

pub async fn openai_inference_handler(
  _http_request: HttpRequest,
  control_state: web::Data<Arc<ControlState>>,
  openai_client: web::Data<Arc<Client>>,
) -> Result<HttpResponse, OpenAiInferenceError> {

  let article = r#"
The U.S. military has been monitoring a suspected Chinese surveillance balloon that has been hovering over the northern U.S. for the past few days, and military and defense leaders have discussed shooting it out of the sky, according to two U.S. officials and a senior defense official.

“The United States government has detected and is tracking a high-altitude surveillance balloon that is over the continental United States right now,” Pentagon spokesperson Brig. Gen. Pat Ryder told NBC News. “We continue to track and monitor it closely.”

“Once the balloon was detected, the U.S. government acted immediately to protect against the collection of sensitive information,” Ryder said.
  "#.to_string();

  let prompt = format!(r#"The following is a news article:

  {}

  Please reword this article as if it was spoken by a reporter.
  "#, article);


  let request = CreateCompletionRequestArgs::default()
      .model("text-davinci-003")
      .prompt(prompt)
      .max_tokens(1200_u16)
      .build()
      .map_err(|err| {
        error!("Could not create OpenAI request: {:?}", err);
        OpenAiInferenceError::ServerError
      })?;

  let response = openai_client
      .completions()
      .create(request)
      .await
      .map_err(|err| {
        error!("Error calling OpenAI: {:?}", err);
        OpenAiInferenceError::ServerError
      })?;

  info!("Open AI response: {:?}", response);

  let text = response.choices.get(0)
      .map(|option| option.text.clone())
      .unwrap_or("".to_string());

  let response = OpenAiInferenceResponse {
    success: true,
    openai_results: text,
  };

  let body = serde_json::to_string(&response)
      .map_err(|e| OpenAiInferenceError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
