use std::sync::Arc;
use crate::api::tts_inference::{CreateTtsInferenceRequest, CreateTtsInferenceResponse, TtsInferenceJobStatus};
use errors::AnyhowResult;
use reqwest::{Client, ClientBuilder, RequestBuilder, Url};
use reqwest::cookie::Jar;
use crate::credentials::FakeYouCredentials;

const AUTHORIZATION_HEADER: &'static str = "Authorization";
const SESSION_COOKIE_NAME : &'static str = "session";

/// A client to consume FakeYou's API via API sessions (vs user sessions).
pub struct FakeYouApiClient {
  api_domain: String,
  credentials: FakeYouCredentials,
  client: Client,
}

impl FakeYouApiClient {

  pub fn make_production_client_from_credentials(credentials: FakeYouCredentials) -> AnyhowResult<Self> {
    let mut client_builder = ClientBuilder::new();

    match &credentials {
      FakeYouCredentials::SessionCookie(credentials ) => {
        let cookie = format!(
          "{}={}; Domain=.fakeyou.com",
          SESSION_COOKIE_NAME,
          &credentials.cookie_value
        );
        let url = "https://fakeyou.com".parse::<Url>()?;
        let jar = Jar::default();
        jar.add_cookie_str(&cookie, &url);
        client_builder = client_builder
            .cookie_store(true)
            .cookie_provider(Arc::new(jar));
      }
      _ => {}, // NB: Other methods don't need handling.
    }

    Ok(Self {
      api_domain: "api.fakeyou.com".to_string(),
      credentials,
      client: client_builder.build()?,
    })
  }

  pub fn make_production_client_from_api_token(api_token: &str) -> Self {
    let credentials = FakeYouCredentials::from_api_token(api_token);
    Self {
      api_domain: "api.fakeyou.com".to_string(),
      credentials,
      client: Client::new(),
    }
  }

  // TODO: need to yield better, more "library"-appropriate errors.
  pub async fn create_tts_inference(&self, request: CreateTtsInferenceRequest<'_>) -> AnyhowResult<CreateTtsInferenceResponse> {
    let url = format!("https://{}/tts/inference", self.api_domain);

    let response = self.add_credentials(self.client
        .post(url))
        .json(&request)
        .send()
        .await?
        .text()
        .await?;

    let response = serde_json::from_str(&response)?;

    Ok(response)
  }

  // TODO: need to yield better, more "library"-appropriate errors.
  pub async fn get_tts_inference_job_status(&self, inference_job_token: &str) -> AnyhowResult<TtsInferenceJobStatus> {
    let url = format!("https://{}/tts/job/{}", self.api_domain, inference_job_token);

    let response = self.add_credentials(self.client
        .get(url))
        .send()
        .await?
        .text()
        .await?;

    let response = serde_json::from_str(&response)?;

    Ok(response)
  }

  fn add_credentials(&self, request_builder: RequestBuilder) -> RequestBuilder {
    match &self.credentials {
      FakeYouCredentials::ApiToken(api_token) => {
        request_builder.header(AUTHORIZATION_HEADER, &api_token.token)
      }
      _ => request_builder, // NB: Other auth types already handled.
    }
  }
}
