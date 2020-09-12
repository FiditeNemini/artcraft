//! Discord bot for vocodes
//! Copyright 2020 Brandon Thomas <echelon@gmail.com>
//!
//! To recreate, set these permissions in Discord:
//! account type: bot
//!   general = view channels
//!   text = send messages, send tts messages, embed links, attach files, read message history
//!   voice = connect, speak, use voice activity, priority speaker
//!
//! To add it to a server, use:
//!  https://discord.com/api/oauth2/authorize?client_id=754149708565315685&permissions=36822272&scope=bot

pub mod vocodes_api;

use hyper::Body;
use hyper::Client as HyperClient;
use hyper::Request;
use hyper_tls::HttpsConnector;
use serenity::client::{Client, Context, EventHandler};
use serenity::model::channel::Message;
use serenity::{
  async_trait,
  client::bridge::gateway::ShardManager,
  http::Http,
  model::{event::ResumedEvent, gateway::Ready},
  prelude::*,
};
use serenity::framework::standard::{
  CommandResult,
  StandardFramework,
  macros::{
    command,
    group
  }
};

use crate::vocodes_api::fetch;
use log::{error, info, warn};
use serenity::http::AttachmentType;
use std::borrow::Cow;
use std::env;
use std::sync::Arc;

const SPEAKER_NAME : &'static str = "david-attenborough";

#[group]
struct General;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
  async fn ready(&self, _: Context, ready: Ready) {
    info!("Connected as {}", ready.user.name);
  }

  async fn resume(&self, _: Context, _: ResumedEvent) {
    info!("Resumed");
  }

  async fn message(&self, ctx: Context, new_message: Message) {
    info!("Message: {:?}", new_message);

    if new_message.author.name == "vocodes" {
      return;
    }

    let replaced_message = if new_message.content.starts_with("vocode ") {
      new_message.content.replacen("vocode ", "", 1)
    } else if new_message.content.starts_with("!vocode ") {
      new_message.content.replacen("!vocode ", "", 1)
    } else {
      return;
    };

    info!("Replaced message: {}", replaced_message);

    if let Ok(response) = fetch(&replaced_message, SPEAKER_NAME).await {
      let msg = new_message.channel_id.send_message(&ctx.http, |m| {
        m.content(replaced_message);
        m.add_file(AttachmentType::Bytes { data: Cow::from(&response), filename: "a wild sound appeared.wav".to_string() });
        m
      }).await;

      if let Err(reason) = msg {
        warn!("Error sending message: {:?}", reason);
      }
    }
  }
}

struct ShardManagerContainer;

impl TypeMapKey for ShardManagerContainer {
  type Value = Arc<Mutex<ShardManager>>;
}

#[tokio::main]
async fn main() {
  env_logger::init();

  let framework = StandardFramework::new()
    .configure(|c| c.prefix("~")) // set the bot prefix to "~"
    .group(&GENERAL_GROUP);

  let secret_token = env::var("DISCORD_TOKEN").expect("token");

  let mut client = Client::new(secret_token)
    .event_handler(Handler)
    .framework(framework)
    .await
    .expect("Error creating client");

  {
    let mut data = client.data.write().await;
    data.insert::<ShardManagerContainer>(client.shard_manager.clone());
  }

  if let Err(reason) = client.start().await {
    error!("An error occurred while running the client: {:?}", reason);
  }
}
