use errors::{anyhow, AnyhowResult};
use jwt_simple::prelude::Base64UrlSafeNoPadding;
use jwt_simple::reexports::ct_codecs::Decoder;
use serde_derive::Deserialize;

#[derive(Deserialize)]
pub(crate) struct JwtHeader {
  /// The key identifier to use to verify the JWT signature
  pub(crate) kid: Option<String>,
  // Other fields absent
}

pub fn decode_jwt_header(jwt: &str) -> AnyhowResult<JwtHeader> {
  let mut parts = jwt.split('.');
  let jwt_header_b64 = parts.next().ok_or(anyhow!("could not split jwt"))?;

  let jwt_header: JwtHeader = serde_json::from_slice(
    &Base64UrlSafeNoPadding::decode_to_vec(jwt_header_b64, None)?,
  )?;

  Ok(jwt_header)
}
