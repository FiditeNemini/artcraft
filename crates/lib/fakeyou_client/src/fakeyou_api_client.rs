use crate::api::tts_inference::{CreateTtsInferenceRequest, CreateTtsInferenceResponse, TtsInferenceJobStatus};
use errors::AnyhowResult;
use reqwest::Client;

const AUTHORIZATION_HEADER: &'static str = "Authorization";

/// A client to consume FakeYou's API via API sessions (vs user sessions).
pub struct FakeYouApiClient {
  api_domain: String,
  api_token: String,
  client: Client,
}

impl FakeYouApiClient {

  pub fn make_production_client(api_token: &str) -> Self {
    Self {
      api_domain: "api.fakeyou.com".to_string(),
      api_token: api_token.to_string(),
      client: Client::new(),
    }
  }

  // TODO: need to yield better, more "library"-appropriate errors.
  pub async fn post_inference(&self, request: CreateTtsInferenceRequest<'_>) -> AnyhowResult<CreateTtsInferenceResponse> {
    let url = format!("https://{}/tts/inference", self.api_domain);

    let response = self.client
        .post(url)
        .header(AUTHORIZATION_HEADER, &self.api_token)
        .json(&request)
        .await?
        .bytes()
        .await?;

    let response = serde_json::from_str(response)?;

    Ok(response)
  }

  // TODO: need to yield better, more "library"-appropriate errors.
  pub async fn get_tts_inference_job_status(&self, inference_job_token: &str) -> AnyhowResult<TtsInferenceJobStatus> {
    let url = format!("https://{}/tts/job/{}", self.api_domain, inference_job_token);

    let response = self.client
        .get(url)
        .header(AUTHORIZATION_HEADER, &self.api_token)
        .await?
        .bytes()
        .await?;

    let response = serde_json::from_str(response)?;

    Ok(response)
  }
}
