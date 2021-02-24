use crate::AnyhowResult;
use std::io::Read;

#[derive(Deserialize)]
pub struct Secrets {
  /// From the creator dashboard of Twitch
  pub twitch_stream_key: String,
  /// Identifies our application uniquely; cannot be reassigned.
  pub application_client_id: String,
  /// Application secret (generated)
  pub application_client_secret: String,
}

impl Secrets {
  pub fn from_file(filename: &str) -> AnyhowResult<Self> {
    let mut file = std::fs::File::open(filename)?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)?;
    let secrets = toml::from_str(&buffer)?;
    Ok(secrets)
  }
}
