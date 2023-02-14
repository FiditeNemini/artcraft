use crate::shared_state::job_state::JobState;
use errors::AnyhowResult;
use fakeyou_client::api::tts_inference::CreateTtsInferenceRequest;
use idempotency::uuid::generate_random_uuid;
use log::{error, info};
use sqlite_queries::queries::by_table::tts_render_targets::list_tts_render_targets::TtsRenderTarget;
use sqlite_queries::queries::by_table::tts_render_targets::update_tts_render_target_successfully_submitted::Args as SuccessArgs;
use sqlite_queries::queries::by_table::tts_render_targets::update_tts_render_target_successfully_submitted::update_tts_render_target_successfully_submitted;
use sqlite_queries::queries::by_table::tts_render_targets::update_tts_render_target_unsuccessfully_submitted::Args as UnsuccessfulArgs;
use sqlite_queries::queries::by_table::tts_render_targets::update_tts_render_target_unsuccessfully_submitted::update_tts_render_target_unsuccessfully_submitted;
use std::sync::Arc;
use tokens::tokens::tts_models::TtsModelToken;

pub async fn process_single_record(target: &TtsRenderTarget, job_state: &Arc<JobState>) -> AnyhowResult<()> {

  info!("Posting FakeYou create TTS request...");

  let tts_model_token = TtsModelToken::new_from_str(&target.tts_voice_identifier);
  let uuid_idempotency_token = generate_random_uuid();
  let tts_render_attempts = target.tts_render_attempts + 1;

  let result = job_state
      .fakeyou_client
      .create_tts_inference(CreateTtsInferenceRequest {
        uuid_idempotency_token: &uuid_idempotency_token,
        tts_model_token: &tts_model_token,
        inference_text: &target.full_text,
      }).await;

  match result {
    Err(err) => {
      error!("problem submitting to FakeYou: {:}", err);

      update_tts_render_target_unsuccessfully_submitted(UnsuccessfulArgs {
        tts_render_task_token: &target.token,
        tts_render_attempts,
        sqlite_pool: &job_state.sqlite_pool,
      }).await?;
    },
    Ok(res) => {
      if !res.success {
        error!("unknown problem in submitting to FakeYou");

        update_tts_render_target_unsuccessfully_submitted(UnsuccessfulArgs {
          tts_render_task_token: &target.token,
          tts_render_attempts,
          sqlite_pool: &job_state.sqlite_pool,
        }).await?;
      } else {
        update_tts_render_target_successfully_submitted(SuccessArgs {
          tts_render_task_token: &target.token,
          sqlite_pool: &job_state.sqlite_pool,
        }).await?;
      }
    },
  }

  Ok(())
}
