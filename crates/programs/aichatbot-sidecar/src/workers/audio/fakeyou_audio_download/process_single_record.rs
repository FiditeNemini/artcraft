use crate::shared_state::job_state::JobState;
use errors::{anyhow, AnyhowResult};
use fakeyou_client::api::tts_inference::{CreateTtsInferenceRequest, TtsInferenceJobStatusStatePayload};
use fakeyou_client::get_audio_url::get_audio_url;
use log::{error, info};
use sqlite_queries::queries::by_table::tts_render_targets::list::tts_render_target::TtsRenderTarget;
use sqlite_queries::queries::by_table::tts_render_targets::update::update_tts_render_target_successfully_downloaded::Args;
use sqlite_queries::queries::by_table::tts_render_targets::update::update_tts_render_target_successfully_downloaded::update_tts_render_target_successfully_downloaded;
use std::sync::Arc;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_render_tasks::TtsRenderTaskToken;

pub async fn process_single_record(target: &TtsRenderTarget, job_state: &Arc<JobState>) -> AnyhowResult<()> {

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
      //update_tts_render_target_unsuccessfully_submitted(UnsuccessfulArgs {
      //  tts_render_task_token: &target.token,
      //  tts_render_attempts,
      //  sqlite_pool: &job_state.sqlite_pool,
      //}).await?;
    },
    Ok(res) => {
      match res.state {
        None => {
          error!("unknown problem in submitting to FakeYou");
          // TODO: Errors
          //update_tts_render_target_unsuccessfully_submitted(UnsuccessfulArgs {
          //  tts_render_task_token: &target.token,
          //  tts_render_attempts,
          //  sqlite_pool: &job_state.sqlite_pool,
          //}).await?;
        }
        Some(payload) => {
          process_download(&target.token, &payload, job_state).await?;
        }
      }
    },
  }

  Ok(())
}

async fn process_download(task_token: &TtsRenderTaskToken, payload: &TtsInferenceJobStatusStatePayload, job_state: &Arc<JobState>) -> AnyhowResult<()> {
  let tts_result_token = match &payload.maybe_result_token {
    None => return Ok(()), // TODO: Wait
    Some(result_token) => result_token.to_string(),
  };

  let bucket_path = match &payload.maybe_public_bucket_wav_audio_path {
    None => return Ok(()), // TODO: Wait
    Some(path) => path.to_string(),
  };

  let audio_url = get_audio_url(&bucket_path, true);

  update_tts_render_target_successfully_downloaded(Args {
    tts_render_task_token: task_token,
    tts_result_token: &tts_result_token,
    result_url: &audio_url,
    sqlite_pool: &job_state.sqlite_pool,
  }).await?;

  Ok(())
}