extern crate twitch_api2;
extern crate reqwest;

use crate::util::anyhow_result::AnyhowResult;
use twitch_api2::TwitchClient;
use twitch_api2::helix::channels::GetChannelInformationRequest;
use twitch_oauth2::{AppAccessToken, Scope, TwitchToken, tokens::errors::AppAccessTokenError, ClientId, ClientSecret};
use crate::twitch::secrets::TwitchSecrets;

pub mod twitch;
pub mod util;

fn main() -> AnyhowResult<()> {
  println!("Hello World");

  use std::error::Error;
  if let Err(err) = run() {
    println!("Error: {:?}", err);
    //let mut e: &'_ dyn Error = err.as_ref();
    //while let Some(cause) = e.source() {
    //  println!("Caused by: {}", cause);
    //  e = cause;
    //}
  }

  Ok(())
}

#[tokio::main]
async fn run() -> AnyhowResult<()> {
  let secrets = TwitchSecrets::from_file("secrets.toml")?;

  let client_id = ClientId::new(&secrets.app_client_id);
  let client_secret = ClientSecret::new(&secrets.app_client_secret);

  let client: TwitchClient<reqwest::Client> = TwitchClient::default();
  let token = AppAccessToken::get_app_access_token(
    &client,
    client_id,
    client_secret,
    Scope::all(),
  ).await?;

  let req = GetChannelInformationRequest::builder()
      //.broadcaster_id("27620241")
      .broadcaster_id("650154491")
      .build();

  println!(
    "{:?}",
    &client.helix.req_get(req, &token).await?.data.unwrap().title
  );

  Ok(())
}