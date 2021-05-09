use crate::AnyhowResult;
use std::io::Read;

#[derive(Deserialize)]
pub struct Secrets {
  pub redis: RedisSecrets,
  pub twitter: TwitterSecrets,
}

#[derive(Deserialize, Clone)]
pub struct RedisSecrets {
  pub username: String,
  pub password: String,
  pub host: String,
  pub port: u32,
}

#[derive(Deserialize, Clone)]
pub struct TwitterSecrets {
  pub api_key: String,
  pub api_secret_key: String,
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

/*impl TwitterSecrets {
  pub fn get_user_config(&self) -> AnyhowResult<UserConfig> {
    let config = UserConfig::builder()
      .name(self.username.to_string())
      .token(self.oauth_access_token.to_string())
      .enable_all_capabilities()
      .build()?;
    Ok(config)
  }
}*/
