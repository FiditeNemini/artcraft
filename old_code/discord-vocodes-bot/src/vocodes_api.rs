use anyhow::Result as AnyhowResult;
use anyhow::bail;
use hyper::Body;
use hyper::Client as HyperClient;
use hyper::Request;
use hyper_tls::HttpsConnector;
use log::{error, debug, info, warn};

const VOCODES_SPEAK_ENDPOINT : &'static str = "http://mumble.stream/speak";

pub async fn fetch(text: &str, speaker: &str) -> AnyhowResult<Vec<u8>> {
  let mut request = format!("{{\"speaker\": \"{}\", \"text\": \"{}\"}}", speaker, text);

  debug!("Req: {}", request);

  let https = HttpsConnector::new();
  let client = HyperClient::builder()
    .build::<_, hyper::Body>(https);

  let req = Request::builder()
    .uri(VOCODES_SPEAK_ENDPOINT)
    .method("POST")
    .header("Origin", "https://vo.codes")
    .header("User-Agent", "Vocodes Discord Bot")
    .header("Connection", "keep-alive")
    .header("Content-Type", "application/json")
    .body(Body::from(request))?;

  let resp = client.request(req).await?;

  info!("Vocodes Response Status: {}", resp.status());

  if resp.status() != 200 {
    bail!("The response code wasn't 200.");
  }

  let bytes = hyper::body::to_bytes(resp.into_body()).await?;
  let result = bytes.to_vec();

  if result.len() == 0 {
    bail!("The response body has zero length.");
  }

  info!("Vocodes Response Length: {}", result.len());

  Ok(result)
}
