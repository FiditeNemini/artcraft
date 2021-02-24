#[macro_use]
extern crate serde_derive;

use crate::filesystem::secrets::Secrets;

pub type AnyhowResult<T> = anyhow::Result<T>;

pub mod filesystem;

pub fn main() -> AnyhowResult<()> {
  println!("Twitch Gateway");

  let twitch_secrets = Secrets::from_file("secrets.toml")?;
  println!("Secret: {}", twitch_secrets.twitch_key);
  Ok(())
}