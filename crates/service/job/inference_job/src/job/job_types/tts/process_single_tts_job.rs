use anyhow::anyhow;
use crate::job_dependencies::JobDependencies;
use errors::AnyhowResult;
use mysql_queries::column_types::tts_model_type::TtsModelType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::{get_tts_model_for_inference_improved, TtsModelForInferenceRecord};
use tokens::tokens::tts_models::TtsModelToken;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou;

pub async fn process_single_tts_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> AnyhowResult<()> {

  let tts_model_token = match job.maybe_model_token.as_deref() {
    None => return Err(anyhow!("no model token on job")),
    Some(model_token) => TtsModelToken::new_from_str(model_token),
  };

  // TODO: Interrogate cache (which also depends on other flags)
  let maybe_tts_model = get_tts_model_for_inference_improved(&job_dependencies.mysql_pool, tts_model_token.as_str()).await?;

  let tts_model = match maybe_tts_model {
    None => return Err(anyhow!("tts model not found: {:?}", tts_model_token)),
    Some(model) => model,
  };

  match tts_model.tts_model_type {
    TtsModelType::Tacotron2 => {
      let _r = tacotron2_v2_early_fakeyou::process_job::process_job(job_dependencies, job, &tts_model).await?;
    }
    TtsModelType::Talknet => {
      // TODO
    }
  }

  Ok(())
}

