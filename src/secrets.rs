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

  pub fn make_consumer_keypair(&self) -> egg_mode::KeyPair {
    egg_mode::KeyPair::new(self.api_key.to_string(), self.api_secret_key.to_string())
  }

  pub fn make_access_keypair(&self) -> AnyhowResult<egg_mode::KeyPair> {
    let access_key = self.access_key
      .map(|s| s.clone())
      .ok_or(anyhow!("No access key!"))?;

    let access_secret = self.access_secret
      .map(|s| s.clone())
      .ok_or(anyhow!("No access secret!"))?;

    Ok(egg_mode::KeyPair::new(access_key, access_secret))
  }

  pub fn get_access_token(&self) -> AnyhowResult<egg_mode::Token::AccessToken> {
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
  pub fn request_access_token(&self) -> AnyhowResult<()> {

    let connection_token = egg_mode::KeyPair::new(consumer_key, consumer_secret);

    let request_token = egg_mode::auth::request_token(&connection_token, "oob")
      .await?;

    warn!("Go to the following URL, sign in, and paste the PIN that comes back:");
    warn!("{}", egg_mode::auth::authorize_url(&request_token));

    let mut pin = String::new();
    std::io::stdin().read_line(&mut pin)?;

    let token_result = egg_mode::auth::access_token(connection_token, &request_token, pin)
      .await?;

    token = token_result.0;
    user_id = token_result.1;
    username = token_result.2;

    /*match token {
      egg_mode::Token::Access {
        access: ref access_token,
        ..
      } => {
        config.push_str(&username);
        config.push('\n');
        config.push_str(&format!("{}", user_id));
        config.push('\n');
        config.push_str(&access_token.key);
        config.push('\n');
        config.push_str(&access_token.secret);
      }
      _ => unreachable!(),
    }*/

    Ok(())
  }
}
