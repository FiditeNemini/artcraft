use crate::AnyhowResult;
use std::io::Read;
use log::{info, warn, debug};
use anyhow::anyhow;

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

  // These have to be obtained over an OAuth-like flow
  pub access_key: Option<String>,
  pub access_secret: Option<String>,
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

impl TwitterSecrets {
  /// This assumes we have a valid pair of access (key, secret).
  pub async fn verify_access_token(&self) -> AnyhowResult<egg_mode::Token> {
    let consumer_keypair = self.make_consumer_keypair();
    let access_keypair = self.make_access_keypair()?;

    let access_token = egg_mode::Token::Access {
      consumer: consumer_keypair,
      access: access_keypair,
    };

    egg_mode::auth::verify_tokens(&access_token).await?;

    Ok(access_token)
  }

  /// Call this to get an access token.
  /// This is an interactive flow that requests input from stdin.
  pub async fn request_access_token(&self) -> AnyhowResult<()> {
    let consumer_keypair = self.make_consumer_keypair();
    let request_token = egg_mode::auth::request_token(&consumer_keypair, "oob")
      .await?;

    warn!("Go to the following URL, sign in, and paste the PIN that comes back:");
    warn!("{}", egg_mode::auth::authorize_url(&request_token));

    let mut pin = String::new();
    std::io::stdin().read_line(&mut pin)?;

    let token_result = egg_mode::auth::access_token(consumer_keypair, &request_token, pin)
      .await?;

    let access_token = token_result.0;
    let user_id = token_result.1;
    let username = token_result.2;

    warn!("Ordinarily these should not be logged, but there is no log aggregator installed.");
    warn!("In any event, it is best to do this locally before creating k8s secrets.");
    warn!("user_id = {:?}", user_id);
    warn!("username = {:?}", username);

    match access_token {
      egg_mode::Token::Access {
        access: ref access,
        ..
      } => {
        warn!("access_key = {:?}", access.key);
        warn!("access_secret = {:?}", access.secret);
      }
      _ => unreachable!(),
    }

    Ok(())
  }

  pub fn make_consumer_keypair(&self) -> egg_mode::KeyPair {
    egg_mode::KeyPair::new(self.api_key.to_string(), self.api_secret_key.to_string())
  }

  pub fn make_access_keypair(&self) -> AnyhowResult<egg_mode::KeyPair> {
    let access_key = self.access_key
      .as_ref()
      .ok_or(anyhow!("No access key!"))?
      .clone();

    let access_secret = self.access_secret
      .as_ref()
      .ok_or(anyhow!("No access secret!"))?
      .clone();

    Ok(egg_mode::KeyPair::new(access_key, access_secret))
  }
}
