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
  /// OAuth access token generated with URL handshake
  pub oauth_access_token: String,

  /// Redis
  pub redis_username: String,
  pub redis_password: String,
  pub redis_host: String,
  pub redis_port: u32,
}

impl Secrets {
  pub fn from_file(filename: &str) -> AnyhowResult<Self> {
    let mut file = std::fs::File::open(filename)?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)?;
    let secrets = toml::from_str(&buffer)?;
    Ok(secrets)
  }

  pub fn redis_url(&self) -> String {
    format!("rediss://{}:{}@{}:{}",
            self.redis_username, self.redis_password, self.redis_host, self.redis_port)
  }
}
