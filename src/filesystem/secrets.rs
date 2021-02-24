use crate::AnyhowResult;
use std::io::Read;

#[derive(Deserialize)]
pub struct Secrets {
  pub twitch_key: String,
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
