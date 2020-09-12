use hyper::Body;
use hyper::Client as HyperClient;
use hyper::Request;
use hyper_tls::HttpsConnector;

const VOCODES_SPEAK_ENDPOINT : &'static str = "http://mumble.stream/speak";

pub async fn fetch(text: &str, speaker: &str) -> Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>> {
  let mut request = format!("{{\"speaker\": \"{}\", \"text\": \"{}\"}}", speaker, text);

  println!("Req: {}", request);

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

  println!("Status: {}", resp.status());

  let bytes = hyper::body::to_bytes(resp.into_body()).await?;
  let result = bytes.to_vec();

  println!("Length: {}", result.len());

  Ok(result)
}
