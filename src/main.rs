// TODO: These are temporary -
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(dead_code)]

use crate::twitch::secrets::TwitchSecrets;
use crate::twitch::websocket_client::{TwitchWebsocketClient, PollingTwitchWebsocketClient};
use crate::util::anyhow_result::AnyhowResult;
use futures_util::{SinkExt, StreamExt};
use log::info;
use reqwest::Url;
use std::time::Duration;
use tokio_tungstenite::{connect_async, tungstenite::{Error as TungsteniteError, Result as TungsteniteResult}, connect_async_with_config};
use twitch_api2::TwitchClient;
use twitch_api2::helix::channels::GetChannelInformationRequest;
use twitch_api2::pubsub::Topic;
use twitch_api2::pubsub;
use twitch_oauth2::{AppAccessToken, Scope, TwitchToken, tokens::errors::AppAccessTokenError, ClientId, ClientSecret};

pub mod twitch;
pub mod util;

const DEFAULT_LOG : &'static str = "debug,rustls=warn,tungstenite=warn";

fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_LOG));

  info!("Starting");

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

  /*let client_id = ClientId::new(&secrets.app_client_id);
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
  );*/


  // Want this:
  // twitch_api2::pubsub::channel_bits::BitsEventData



  /*// We want to subscribe to moderator actions on channel with id 1234
  // as if we were a user with id 4321 that is moderator on the channel.
  let chat_mod_actions = pubsub::moderation::ChatModeratorActions {
    user_id: 4321,
    channel_id: 1234,
  }
      .into_topic();*/

  // Listen to follows as well
  /*let follows = pubsub::following::Following { channel_id: 1234 }.into_topic();
  let topics = [follows];
  // Create the topic command to send to twitch
  let command = pubsub::listen_command(
    &topics,
    "authtoken",
    "random nonce string",
  )?;

  println!("Pubsub command: {:?}", command);*/

  // Send the message with your favorite websocket client
  //send_command(command).unwrap();
  // To parse the websocket messages, use pubsub::Response::parse


  /*println!("Connected");
  let mut ws_client = TwitchWebsocketClient::new()?;
  ws_client.connect().await?;

  ws_client.send_ping().await?;

  println!("success ping");*/

  let mut client = PollingTwitchWebsocketClient::new()?;

  println!("Connecting...");
  client.connect().await?;
  println!("Connected");

  println!("Starting polling thread...");
  client.start_ping_thread().await;


  // We want to subscribe to moderator actions on channel with id 1234
  // as if we were a user with id 4321 that is moderator on the channel.
  let chat_mod_actions = pubsub::moderation::ChatModeratorActions {
    user_id: 4321,
    channel_id: 1234,
  }.into_topic();

  // Listen to follows as well
  let follows = pubsub::following::Following { channel_id: 1234 }.into_topic();

  println!("Begin LISTEN...");
  client.listen("auth_token", &[chat_mod_actions, follows]).await;


  println!("Try read next...");
  let r = client.try_next().await?;
  println!("Result: {:?}", r);

  println!("Try read next...");
  let r = client.try_next().await?;
  println!("Result: {:?}", r);

  println!("Try read next...");
  let r = client.try_next().await?;
  println!("Result: {:?}", r);

  println!("Sleep...");
  std::thread::sleep(Duration::from_millis(30000));

  //let text = msg.into_text()?;
  //println!("Text: {}", text);

  Ok(())
}


async fn get_case_count() -> TungsteniteResult<u32> {
  let (mut socket, _) = connect_async(
    Url::parse("ws://localhost:9001/getCaseCount").expect("Can't connect to case count URL"),
  )
      .await?;
  let msg = socket.next().await.expect("Can't fetch case count")?;
  socket.close(None).await?;
  Ok(msg.into_text()?.parse::<u32>().expect("Can't parse case count"))
}