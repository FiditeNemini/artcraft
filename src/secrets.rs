use crate::AnyhowResult;
use std::io::Read;

#[derive(Deserialize)]
pub struct Secrets {
  pub redis: RedisSecrets,
  pub twitch: TwitchSecrets,
}

#[derive(Deserialize, Clone)]
pub struct RedisSecrets {
  pub username: String,
  pub password: String,
  pub host: String,
  pub port: u32,
}

#[derive(Deserialize, Clone)]
pub struct TwitchSecrets {
  /// Twitch username
  pub username: String,

  /// From the creator dashboard of Twitch
  pub stream_key: String,

  /// Identifies our application uniquely; cannot be reassigned.
  pub application_client_id: String,

  /// Application secret (generated)
  pub application_client_secret: String,

  /// OAuth access token generated with URL handshake
  /// NB: This changes frequently and must be regenerated.
  /// Go to this URL:
  ///
  /// https://id.twitch.tv/oauth2/authorize?response_type=token
  ///   &client_id=___APPLICATION_CLIENT_ID___
  ///   &redirect_uri=http://localhost&scope=viewing_activity_read%20user_read%20channel_read%20chat:read
  ///   &state=randomUUID
  ///
  /// Which will redirect to 'localhost' per the redirect_uri.
  /// The oauth token will be "access_token" prepended with "oauth:" (which isn't included)
  pub oauth_access_token: String,

  /// Channels to join and monitor.
  pub watch_channels: Vec<String>,
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

impl RedisSecrets {
  pub fn connection_url(&self) -> String {
    format!("rediss://{}:{}@{}:{}", self.username, self.password, self.host, self.port)
  }
}

