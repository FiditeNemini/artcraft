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

use log::{error, info};
use std::sync::Arc;
use serenity::http::AttachmentType;
use std::borrow::Cow;
use std::env;

pub async fn fetch(text: &str, speaker: &str) -> Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>> {
  let url = "http://mumble.stream/speak";
  let mut request = format!("{{\"speaker\": \"{}\", \"text\": \"{}\"}}", speaker, text);

  println!("Req: {}", request);

  let https = HttpsConnector::new();
  let client = HyperClient::builder()
    .build::<_, hyper::Body>(https);

  let req = Request::builder()
    .method("POST")
    .header("Origin", "https://vo.codes")
    .header("User-Agent", "Vocodes Discord Bot")
    .header("Connection", "keep-alive")
    .header("Content-Type", "application/json")
    .uri(url)
    .body(Body::from(request))
    .unwrap();

  let resp = client.request(req).await?;

  println!("Status: {}", resp.status());

  let bytes = hyper::body::to_bytes(resp.into_body()).await?;
  let result = bytes.to_vec();
  println!("Length: {}", result.len());

  Ok(result)
}

/*
  // bot |
  // general = view channels
  // text = send messages, send tts messages, embed links, attach files, read message history
  // voice = connect, speak, use voice activity, priority speaker
  let oauth_url = "https://discord.com/api/oauth2/authorize?client_id=754149708565315685&permissions=36822272&scope=bot";
 */

#[group]
#[commands(test)]
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

    if new_message.author.name == "vocodes"
      || !new_message.content.starts_with("vocode ") {
      return;
    }

    let replaced_message = new_message.content.replacen("vocode ", "", 1);

    info!("Replaced message: {}", replaced_message);

    let mut response = fetch(&replaced_message, "david-attenborough").await.unwrap();

    let msg = new_message.channel_id.send_message(&ctx.http, |m| {
      m.add_file(AttachmentType::Bytes { data: Cow::from(&response), filename: "filename.wav".to_string() });
      m
    }).await;

    if let Err(why) = msg {
      println!("Error sending message: {:?}", why);
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
    .configure(|c| c.prefix("~")) // set the bot's prefix to "~"
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

#[command]
async fn test(ctx: &Context, msg: &Message) -> CommandResult {
  println!("Event");
  msg.reply(ctx, "test!").await?;

  Ok(())
}
