#[macro_use]
extern crate serde_derive;


pub mod filesystem;

pub type AnyhowResult<T> = anyhow::Result<T>;

use twitch_api2::{Client, helix::channels::GetChannelInformationRequest};
use twitch_oauth2::{AppAccessToken, Scope, TokenError, TwitchToken, ClientId, ClientSecret};
use crate::filesystem::secrets::Secrets;

fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
  println!("Twitch Gateway");
  let twitch_secrets = Secrets::from_file("secrets.toml").expect("unable to parse secrets");

  use std::error::Error;
  if let Err(err) = run(&twitch_secrets) {
    println!("Error: {}", err);
    let mut e: &'_ dyn Error = err.as_ref();
    while let Some(cause) = e.source() {
      println!("Caused by: {:?}", cause);
      e = cause;
    }
  }
  Ok(())
}

#[tokio::main]
async fn run(secrets: &Secrets) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
  let client_id = ClientId::new(secrets.application_client_id.to_string());
  let client_secret = ClientSecret::new(secrets.application_client_secret.to_string());

  let token =
      match AppAccessToken::get_app_access_token(client_id, client_secret, Scope::all()).await {
        Ok(t) => t,
        Err(TokenError::RequestError(e)) => panic!("got error: {:?}", e),
        Err(e) => panic!(e),
      };
  let client = Client::new();
  let req = GetChannelInformationRequest::builder()
      .broadcaster_id("27620241")
      .build();

  println!("{:?}", &client.helix.req_get(req, &token).await?.data[0].title);

  Ok(())
}
