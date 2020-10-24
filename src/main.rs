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
use anyhow::Error;

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

    let (speaker, filename, replaced_message) = if new_message.content.starts_with("vocode ") {
      let speaker = "david-attenborough";
      let filename = "a wild sound appeared.wav";
      let message = new_message.content.replacen("vocode ", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!vocode ") {
      let speaker = "david-attenborough";
      let filename = "a wild sound appeared.wav";
      let message = new_message.content.replacen("!vocode ", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!donald") {
      let speaker = "donald-trump";
      let filename = "billions and billions.wav";
      let message = new_message.content.replacen("!donald", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!snake ") {
      let speaker = "solid-snake";
      let filename = "hiding in a box.wav";
      let message = new_message.content.replacen("!snake ", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!sonic ") {
      let speaker = "sonic";
      let filename = "gotta go fast.wav";
      let message = new_message.content.replacen("!sonic ", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!spongebob ") {
      let speaker = "spongebob-squarepants";
      let filename = "three hours later.wav";
      let message = new_message.content.replacen("!spongebob ", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!gilbert ") {
      let speaker = "gilbert-gottfried";
      let filename = "a lovely voice.wav";
      let message = new_message.content.replacen("!gilbert ", "", 1);
      (speaker, filename, message)
    } else if new_message.content.starts_with("!help") {
      let msg = new_message.channel_id.send_message(&ctx.http, |m| {
        m.content(
          "The following commands are available:\n\
            ```\n\
            !help (this help message)\n\
            !vocode (David Attenborough)\n\
            !donald (Yuge)\n\
            !gilbert (Gilbert Gottfried)\n\
            !snake (in a box)\n\
            !sonic (the Hedgehog)\n\
            !spongebob (the SquarePants)\n\
            ```"
        );
        m
      }).await;

      if let Err(reason) = msg {
        warn!("Error sending help message: {:?}", reason);
      }

      return
    } else {
      return;
    };

    info!("Replaced message: {}", replaced_message);

    match fetch(&replaced_message, speaker).await {
      Err(err) => {
        warn!("Error fetching from vocodes TTS: {:?}", err);
      },
      Ok(response) => {
        let discord_result = new_message.channel_id.send_message(&ctx.http, |m| {
          m.content(replaced_message);
          m.add_file(AttachmentType::Bytes { data: Cow::from(&response), filename: filename.to_string() });
          m
        }).await;
        match discord_result {
          Err(reason) => {
            warn!("Error sending message: {:?}", reason);
          },
          Ok(_) => {
            info!("Message posted to discord successfully!");
          },
        }
      },
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

  info!("Initializing app...");
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

  info!("Starting Discord client...");
  if let Err(reason) = client.start().await {
    error!("An error occurred while running the client: {:?}", reason);
  }
}
