//! Static FakeYou API tokens can be read from a config file.
//! This will be a stopgap until we deploy the full system.

use std::fs::File;
use std::io::Read;
use container_common::anyhow_result::AnyhowResult;

#[derive(Clone, Deserialize, Debug)]
pub struct StaticApiTokens {
  pub api_tokens: Vec<StaticApiTokenConfig>
}

#[derive(Clone, Deserialize, Debug)]
pub struct StaticApiTokenConfig {
  /// API token.
  pub api_token: String,
  /// Force this user token if present.
  pub maybe_user_token: Option<String>,
  /// Priority level to force
  /// Defaults to "1" if not set.
  pub maybe_priority_level: Option<u8>,
}

impl StaticApiTokens {

  pub fn read_from_file(filename: &str) -> AnyhowResult<StaticApiTokens> {
    let mut file = File::open(filename)?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)?;
    let api_tokens = toml::from_str(&buffer)?;
    Ok(api_tokens)
  }
}
