//! A Twitter bot for Vo.codes
//! Copyright 2020 Brandon Thomas

mod common;
mod workers;

use anyhow::bail;
use crate::workers::{spawn_workers, Workload};
use crossbeam::Receiver;
use easyenv::{init_env_logger, get_env_num};
use egg_mode::media::{media_types, upload_media, set_metadata, get_status, ProgressInfo, MediaHandle};
use egg_mode::stream::StreamMessage;
use egg_mode::tweet::DraftTweet;
use futures::TryStreamExt;
use log::{warn, info, error};
use std::{env, thread};
use std::io::{stdout, Write};
use std::path::PathBuf;
use std::time::Duration;
use tokio::time::delay_for;
use egg_mode::error::Error;
use tokio::runtime::Builder;

pub type AnyhowResult<T> = anyhow::Result<T>;

#[derive(Clone)]
pub struct Secrets {
  pub api_key: String,
  pub api_secret_key: String,
  pub access_token: String,
  pub access_token_secret: String,
  pub username: String,
  // Not sure where to get the user id, or what it's used for.
  pub user_id: u64,
}

impl Secrets {
  pub fn load_from_env() -> AnyhowResult<Self> {
    Ok(Secrets {
      api_key: env::var("API_KEY")?,
      api_secret_key: env::var("API_SECRET_KEY")?,
      access_token: env::var("ACCESS_TOKEN")?,
      access_token_secret: env::var("ACCESS_TOKEN_SECRET")?,
      username: env::var("USERNAME")?,
      user_id: get_env_num::<u64>("USER_ID", 0)?,
    })
  }
}

fn main() -> AnyhowResult<()> {
  /*let mut runtime = Builder::new()
    .build()
    .unwrap()
    .block_on(async {
      main_2().await
    });*/

  let mut runtime = tokio::runtime::Builder::new()
    .threaded_scheduler()
    .enable_all()
    .on_thread_start(|| {
      println!("thread started");
    })
    .build()
    .unwrap();

  runtime.block_on(main_2());


  Ok(())
}

//#[tokio::main]
async fn main_2() -> AnyhowResult<()> {

  init_env_logger(None);

  let secrets = Secrets::load_from_env()?;

  info!("Loading configs and logging in...");

  let config = common::Config::load(secrets.clone()).await;

  info!("Configs loaded. Spawning workers...");

  let (sender, receiver) = crossbeam::bounded(5);
  spawn_workers(config.clone(), receiver, 5).await;

  info!("Streaming tweets...");

  thread::sleep(Duration::from_secs(10));

  let stream = egg_mode::stream::filter()
    .track(&["vocodesbot"])
    .language(&["en"])
    .start(&config.token)
    .try_for_each(|m| {
      if let StreamMessage::Tweet(tweet) = m {
        common::print_tweet(&tweet);
        println!("──────────────────────────────────────");

        sender.send(Workload { info: tweet.text.clone() });

        info!("Responding...");
        let fut = async {
          let path = PathBuf::from("/home/bt/dev/voice/ffmpeg-server/output/out.mp4");

          match respond_with_media(&config, "Hello, this is a response.", path, "some media").await {
            Err(e) => warn!("An error: {:?}", e),
            Ok(e) => info!("Response posted."),
          }
        };

      } else {
        println!("Not a message: {:?}", m);
      }

      futures::future::ok(())
    });


  if let Err(e) = stream.await {
    let e : egg_mode::error::Error = e;
    error!("Stream error: {}", &e);
    match e {
      Error::BadUrl => {},
      Error::InvalidResponse(_, _) => {},
      Error::MissingValue(_) => {},
      Error::FutureAlreadyCompleted => {},
      Error::TwitterError(_, _) => {},
      Error::RateLimit(rate_limit) => {
        error!("Rate limited. Will reopen at unix timestamp: {}", rate_limit);
      },
      Error::MediaError(_) => {},
      Error::BadStatus(_) => {},
      Error::NetError(_) => {},
      Error::TlsError(_) => {},
      Error::IOError(_) => {},
      Error::DeserializeError(_) => {},
      Error::TimestampParseError(_) => {},
      Error::TimerShutdownError(_) => {},
      Error::HeaderParseError(_) => {},
      Error::HeaderConvertError(_) => {},
    }
    error!("Disconnected")
  }

  Ok(())
}

async fn respond_with_media(
  config: &common::Config,
  tweet_text: &str,
  media_path: PathBuf,
  media_alt_text: &str) -> Result<(), Box<dyn std::error::Error>>
{
  let mut tweet = DraftTweet::new(tweet_text.to_string());

  let handle = upload_media_to_twitter(config, media_path, media_alt_text).await?;
  tweet.add_media(handle.id.clone());

  tweet.send(&config.token).await?;

  Ok(())
}

async fn upload_media_to_twitter(
  config: &common::Config,
  media_path: PathBuf,
  media_alt_text: &str) -> AnyhowResult<MediaHandle>
{
  println!("Uploading media from '{}'", media_path.display());

  let typ = match media_path.extension().and_then(|os| os.to_str()).unwrap_or("") {
    "jpg" | "jpeg" => media_types::image_jpg(),
    "gif" => media_types::image_gif(),
    "png" => media_types::image_png(),
    "webp" => media_types::image_webp(),
    "mp4" => media_types::video_mp4(),
    _ => {
      eprintln!("Format not recognized, must be one of [jpg, jpeg, gif, png, webp, mp4]");
      std::process::exit(1);
    }
  };

  let bytes = std::fs::read(media_path)?;
  let handle = upload_media(&bytes, &typ, &config.token).await?;

  set_metadata(&handle.id, media_alt_text, &config.token).await?;

  println!("Media uploaded");

  // Wait 60 seconds for processing
  println!("Waiting for media to finish processing...");

  for ct in 0..=60u32 {
    match get_status(handle.id.clone(), &config.token).await?.progress {
      None | Some(ProgressInfo::Success) => {
        println!("\nMedia sucessfully processed");
        break;
      }
      Some(ProgressInfo::Pending(_)) | Some(ProgressInfo::InProgress(_)) => {
        print!(".");
        stdout().flush()?;
        delay_for(Duration::from_secs(1)).await;
      }
      Some(ProgressInfo::Failed(err)) => Err(err)?,
    }
    if ct == 60 {
      bail!("Error: timeout");
    }
  }

  Ok(handle)
}
