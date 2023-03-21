use anyhow::anyhow;
use errors::AnyhowResult;
use mysql_queries::column_types::tts_model_type::TtsModelType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference::get_tts_model_for_inference;
use tokens::tokens::tts_models::TtsModelToken;
use crate::job::job_steps::job_dependencies::JobDependencies;

pub async fn process_single_tts_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> AnyhowResult<()> {

  let tts_model_token = match job.maybe_model_token.as_deref() {
    None => return Err(anyhow!("no model token on job")),
    Some(model_token) => TtsModelToken::new_from_str(model_token),
  };

  // TODO: Interrogate cache
  let tts_model = get_tts_model_for_inference(&job_dependencies.mysql_pool, tts_model_token.as_str()).await?;


  Ok(())
}

