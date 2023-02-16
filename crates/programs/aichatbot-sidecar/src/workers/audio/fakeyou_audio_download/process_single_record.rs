use std::io::Cursor;
use crate::shared_state::job_state::JobState;
use errors::{anyhow, AnyhowResult};
use fakeyou_client::api::tts_inference::{CreateTtsInferenceRequest, TtsInferenceJobStatusStatePayload};
use fakeyou_client::get_audio_url::get_audio_url;
use log::{error, info};
use sqlite_queries::queries::by_table::tts_render_tasks::list::tts_render_task::TtsRenderTask;
use sqlite_queries::queries::by_table::tts_render_tasks::update::update_tts_render_task_successfully_downloaded::Args;
use sqlite_queries::queries::by_table::tts_render_tasks::update::update_tts_render_task_successfully_downloaded::update_tts_render_task_successfully_downloaded;
use std::sync::Arc;
use media::decode_basic_audio_info::decode_basic_audio_info;
use tokens::tokens::news_stories::NewsStoryToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_render_tasks::TtsRenderTaskToken;

pub async fn process_single_record(target: &TtsRenderTask, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  info!("Attempting to download audio...");

  let inference_job_token = match &target.maybe_inference_job_token {
    None => return Err(anyhow!("tts result has no inference job token")),
    Some(token) => token.to_string(),
  };

  let result = job_state
      .fakeyou_client
      .get_tts_inference_job_status(&inference_job_token).await;

  match result {
    Err(err) => {
      error!("problem submitting to FakeYou: {:}", err);

      // TODO: Errors
      //update_tts_render_task_unsuccessfully_submitted(UnsuccessfulArgs {
      //  tts_render_task_token: &target.token,
      //  tts_render_attempts,
      //  sqlite_pool: &job_state.sqlite_pool,
      //}).await?;
    },
    Ok(res) => {
      match res.state {
        None => {
          error!("unknown problem in checking FakeYou TTS inference job status");
          // TODO: Errors
          //update_tts_render_task_unsuccessfully_submitted(UnsuccessfulArgs {
          //  tts_render_task_token: &target.token,
          //  tts_render_attempts,
          //  sqlite_pool: &job_state.sqlite_pool,
          //}).await?;
        }
        Some(payload) => {
          process_download(&target, &payload, job_state).await?;
        }
      }
    },
  }

  Ok(())
}

async fn process_download(target: &TtsRenderTask, payload: &TtsInferenceJobStatusStatePayload, job_state: &Arc<JobState>) -> AnyhowResult<()> {
  let tts_result_token = match &payload.maybe_result_token {
    None => return Ok(()), // TODO: Wait
    Some(result_token) => result_token.to_string(),
  };

  let bucket_path = match &payload.maybe_public_bucket_wav_audio_path {
    None => return Ok(()), // TODO: Wait
    Some(path) => path.to_string(),
  };

  let audio_url = get_audio_url(&bucket_path, true);
  let news_story_token = NewsStoryToken::new_from_str(&target.story_token);

  {
    let directory = job_state.save_directory.directory_for_audio(&news_story_token)?;
    std::fs::create_dir_all(&directory)?;
  }

  let download_filename = job_state.save_directory
      .audio_wav_file_for_news_story(&news_story_token, target.sequence_order)?;

  {
    let response = reqwest::get(&audio_url).await?;
    let mut file = std::fs::File::create(&download_filename)?;
    let mut content =  Cursor::new(response.bytes().await?);
    std::io::copy(&mut content, &mut file)?;
  }

  let audio_info = {
    let bytes = std::fs::read(&download_filename)?;
    decode_basic_audio_info(
      &bytes,
      Some("audio/wav"),
      Some(".wav"))?
  };

  let audio_duration_millis = audio_info.duration_millis.unwrap_or(0) as i64;

  update_tts_render_task_successfully_downloaded(Args {
    tts_render_task_token: &target.token,
    tts_result_token: &tts_result_token,
    result_url: &audio_url,
    audio_duration_millis,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}