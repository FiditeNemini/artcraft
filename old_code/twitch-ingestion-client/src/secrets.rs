use crate::AnyhowResult;
use std::io::Read;
use twitchchat::UserConfig;

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
  pub uses_tls: bool,
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
  pub fn new(username: &str, password: &str, host: &str, port: u32, uses_tls: bool) -> Self {
    Self {
      username: username.to_string(),
      password: password.to_string(),
      host: host.to_string(),
      port,
      uses_tls,
    }
  }

  pub fn connection_url(&self) -> String {
    let protocol = if self.uses_tls { "rediss" } else { "redis" };
    let mut auth = "".to_string();

    if !self.username.is_empty() {
      if !self.password.is_empty() {
        auth = format!("{}:{}@", self.username, self.password);
      } else {
        auth = format!("{}@", self.username);
      }
    } else if !self.password.is_empty() {
      auth = format!("default:{}@", self.password);
    }

    format!("{}://{}{}:{}", protocol, auth, self.host, self.port)
  }
}

impl TwitchSecrets {
  pub fn new(username: &str,
             stream_key: &str,
             application_client_id: &str,
             application_client_secret: &str,
             oauth_access_token: &str,
             watch_channels: &Vec<String>) -> Self {

    Self {
      username: username.to_string(),
      stream_key: stream_key.to_string(),
      application_client_id: application_client_id.to_string(),
      application_client_secret: application_client_secret.to_string(),
      oauth_access_token: oauth_access_token.to_string(),
      watch_channels: watch_channels.clone(),
    }
  }

  pub fn get_user_config(&self) -> AnyhowResult<UserConfig> {
    let config = UserConfig::builder()
        .name(self.username.to_string())
        .token(self.oauth_access_token.to_string())
        .enable_all_capabilities()
        .build()?;
    Ok(config)
  }
}
