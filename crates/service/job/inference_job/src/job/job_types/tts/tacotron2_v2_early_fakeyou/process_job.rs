use crate::job::job_steps::job_dependencies::JobDependencies;
use errors::AnyhowResult;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::TtsModelForInferenceRecord;

pub async fn process_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob, tts_model: &TtsModelForInferenceRecord) -> AnyhowResult<()> {

  Ok(())
}
