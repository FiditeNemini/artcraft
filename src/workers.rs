use crate::{common, AnyhowResult};
use crossbeam::Receiver;
use log::{info, error, warn};
use std::thread;
use tokio::time::Duration;
use std::path::PathBuf;
use egg_mode::media::{MediaHandle, media_types, upload_media, set_metadata, get_status, ProgressInfo};
use egg_mode::tweet::DraftTweet;
use anyhow::Error;
use tokio::runtime::Handle;

pub struct Workload {
  pub info: String,
}


pub async fn spawn_workers(config: common::Config, receiver: Receiver<Workload>, num_workers: usize) {
  //thread::sleep(Duration::from_secs(5));

  for i in 0 .. num_workers {
    let conf = config.clone();
    let recv = receiver.clone();

    info!("Spawning worker {}", i);

    let handle = Handle::current();

    //tokio::task::spawn(async move {});
    handle.spawn(async move {
      info!("a");
      start_worker(conf, recv, i).await;
      info!("b");
    });


    //thread::spawn(move || start_worker(conf, recv, i));
  }

  //joinables.iter().map(|j| j.join());
}

async fn start_worker(config: common::Config, receiver: Receiver<Workload>, worker_id: usize) {
  loop {
    info!("Worker thread loop - listening: {}", worker_id);

    let workload = match receiver.recv() {
      Err(e) => {
        warn!("Error receiving from queue: {}", e);
        thread::sleep(Duration::from_millis(500));
        continue;
      },
      Ok(workload) => workload,
    };

    info!("Worker {} got tweet: {}", worker_id, &workload.info);

    let path = PathBuf::from("/home/bt/dev/voice/ffmpeg-server/output/out.mp4");

    let r = respond_with_media(&config, "generic response", path, "media");

    match r {
      Ok(_) => info!("Responded to tweet successfully"),
      Err(e) => error!("Error responding to tweet: {}", e),
    }
  }
}

fn respond_with_media(
  config: &common::Config,
  tweet_text: &str,
  media_path: PathBuf,
  media_alt_text: &str) -> AnyhowResult<()>
{

  // let rt = tokio::runtime::Runtime::new().unwrap();
  // let mut executor = rt.executor();

  // executor.spawn(async {
  //   let mut tweet = DraftTweet::new(tweet_text.to_string());

  //   //let handle = upload_media_to_twitter(config, media_path, media_alt_text).await?;
  //   //tweet.add_media(handle.id.clone());

  //   tweet.send(&config.token).await
  // });

  // tokio::task::spawn_blocking({
  //   fut
  // })?;
  //futures::executor::block_on(fut)?;

  Ok(())
}

/*fn upload_media_to_twitter(
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
*/