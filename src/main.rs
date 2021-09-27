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
use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_api2::helix::users::GetUsersRequest;
use twitch_api2::types::Nickname;
use crate::twitch::client::TwitchClientWrapper;

pub mod twitch;
pub mod util;

const DEFAULT_LOG : &'static str = "debug,rustls=warn,tungstenite=warn";

const TEST_CHANNEL_ID : u32 = 650154491; // Test channel

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
  // ==================== APPLICATION ACCESS ====================

  let secrets = TwitchSecrets::from_file("secrets.toml")?;
  let client_id = ClientId::new(&secrets.app_client_id);
  let client_secret = ClientSecret::new(&secrets.app_client_secret);

  info!("Getting app access token...");

  //let scopes = Scope::all();
  let scopes = vec![
    Scope::BitsRead,
    Scope::UserReadEmail,
  ];

  let mut twitch_client = TwitchClientWrapper::new(client_id.clone(), client_secret.clone());
  twitch_client.request_access_token(scopes).await?;

  info!("Getting user id ...");

  let user_id = twitch_client.get_user_id_from_username("testytest512").await?;

  info!("User ID: {}", user_id);

  //std::thread::sleep(Duration::from_secs(5000));


  // ==================== OAUTH FLOW ====================

  println!("Oauth flow...");

  let redirect_url = twitch_oauth2::url::Url::parse("http://localhost/test")?;
  let mut builder = UserTokenBuilder::new(client_id, client_secret, redirect_url)
      .set_scopes(Scope::all())
      .force_verify(true);

  //builder.add_scope(Scope::BitsRead);

  let (url, _csrf_token) = builder.generate_url();

  println!("Go to this page: {}", url);

  //std::thread::sleep(Duration::from_secs(3000));


  // ==================== PUBSUB SUBSCRIPTION AND MAIN LOOP ====================

  let mut client = PollingTwitchWebsocketClient::new()?;

  println!("Connecting PubSub...");
  client.connect().await?;

  println!("Connected");

  //println!("Starting polling thread...");
  //client.start_ping_thread().await;

  println!("Sending PING...");

  client.send_ping().await?;

  println!("Try read next...");
  let r = client.try_next().await?;
  println!("Result: {:?}", r);


  let bit_topic = pubsub::channel_bits::ChannelBitsEventsV2 {
    channel_id: TEST_CHANNEL_ID,
  }.into_topic();

  println!("Begin LISTEN...");
  //let auth_token = access_token.access_token.as_str();
  let auth_token = "";
  let topics = [bit_topic];

  client.listen(auth_token, &topics).await?;


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

/*

  // We want to subscribe to moderator actions on channel with id 1234
  // as if we were a user with id 4321 that is moderator on the channel.
  let chat_mod_actions = pubsub::moderation::ChatModeratorActions {
    user_id: 4321,
    channel_id: 1234,
  }.into_topic();

  // Listen to follows as well
  let follows = pubsub::following::Following { channel_id: 1234 }.into_topic();
 */

//match UserToken::from_existing(reqwest_http_client, token, None, None).await {
//  Ok(t) => println!("user_token: {}", t.token().secret()),
//  Err(e) => panic!("got error: {}", e),
//}

