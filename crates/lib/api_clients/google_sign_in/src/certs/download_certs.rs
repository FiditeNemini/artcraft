use crate::certs::jwk_to_public_key::jwk_to_public_key;
use crate::certs::key_map::KeyMap;
use errors::{anyhow, AnyhowResult};

/// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
/// "These keys are regularly rotated; examine the Cache-Control header in
///  the response to determine when you should retrieve them again."
const GOOGLE_CERTS_URL : &str = "https://www.googleapis.com/oauth2/v3/certs";

pub async fn download_cert_key_set() -> AnyhowResult<KeyMap> {
  let certs = download_certs().await?;
  let key_map = jwk_to_public_key(&certs)?;
  Ok(key_map)
}

pub async fn download_certs() -> AnyhowResult<String> {
  let response = reqwest::get(GOOGLE_CERTS_URL).await?;

  if !response.status().is_success() {
    return Err(anyhow!("Failed to download Google certs: {:?}", response.status()));
  }

  let body = response.text().await?;
  Ok(body)
}
