use crate::shared_state::job_state::JobState;
use crate::workers::audio::fakeyou_audio_download::process_single_record::process_single_record;
use enums::by_table::tts_render_targets::tts_render_status::TtsRenderStatus;
use enums::by_table::web_scraping_targets::scraping_status::ScrapingStatus;
use errors::AnyhowResult;
use log::{debug, error, info};
use sqlite_queries::queries::by_table::tts_render_targets::list::list_tts_render_targets_awaiting_download::list_tts_render_targets_awaiting_download;
use sqlite_queries::queries::by_table::tts_render_targets::list::list_tts_render_targets_awaiting_render::list_tts_render_targets_awaiting_render;
use sqlite_queries::queries::by_table::web_scraping_targets::insert_web_scraping_target::{Args, insert_web_scraping_target};
use sqlite_queries::queries::by_table::web_scraping_targets::list_web_scraping_targets::WebScrapingTarget as WebScrapingTargetRecord;
use sqlite_queries::queries::by_table::web_scraping_targets::list_web_scraping_targets::list_web_scraping_targets;
use sqlx::sqlite::SqlitePoolOptions;
use std::future::Future;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use strum::IntoEnumIterator;
use web_scrapers::payloads::web_scraping_result::ScrapedWebArticle;
use web_scrapers::payloads::web_scraping_target::WebScrapingTarget;
use web_scrapers::sites::cnn::cnn_indexer::{cnn_indexer, CnnFeed};
use web_scrapers::sites::techcrunch::techcrunch_indexer::{techcrunch_indexer, TechcrunchFeed};

/// See if jobs are complete and download the audio.
pub async fn fakeyou_audio_download_main_loop(job_state: Arc<JobState>) {
  loop {
    debug!("fakeyou_audio_download main loop");

    while job_state.app_control_state.is_fakeyou_paused() {
      thread::sleep(Duration::from_secs(5));
    }

    query_and_process_jobs(&job_state).await;

    info!("fakeyou_audio_download loop finished; waiting...");
    thread::sleep(Duration::from_secs(60));
  }
}


async fn query_and_process_jobs(job_state: &Arc<JobState>) {
  const BATCH_SIZE : i64 = 10;

  let mut last_id = 0;
  let mut failure_count = 0;

  loop {
    // NB: Protect sqlite from contention.
    thread::sleep(Duration::from_millis(500));

    debug!("fakeyou_audio_create querying targets from id > {} ...", last_id);

    let query_result = list_tts_render_targets_awaiting_download(
      last_id, BATCH_SIZE, &job_state.sqlite_pool).await;

    let targets = match query_result {
      Ok(targets) => targets,
      Err(err) => {
        error!("failure querying batch: {:?}", err);

        failure_count += 1;

        // NB: Don't starve progress.
        if failure_count > 2 {
          failure_count = 0;
          last_id += 1;
        } else if failure_count > 3 {
          return;
        }

        continue;
      }
    };

    failure_count = 0;

    if targets.is_empty() {
      return; // Done with batches.
    }

    for target in targets {
      debug!("Download audio: {}/{}", target.story_type, target.story_token);

      while job_state.app_control_state.is_fakeyou_paused() {
        thread::sleep(Duration::from_secs(5));
      }

      let result = process_single_record(&target, job_state).await;
      if let Err(err) = result {
        error!("Error processing target: {:?}", err);
      }

      last_id = target.id;

      thread::sleep(Duration::from_secs(3));
    }
  }
}
