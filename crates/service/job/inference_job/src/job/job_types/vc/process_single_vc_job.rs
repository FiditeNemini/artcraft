use anyhow::anyhow;
use log::warn;
use enums::by_table::voice_conversion_models::voice_conversion_model_type::VoiceConversionModelType;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use errors::AnyhowResult;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::voice_conversion::inference::get_voice_conversion_model_for_inference::get_voice_conversion_model_for_inference;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_types::vc::so_vits_svc;
use crate::job::job_types::vc::so_vits_svc::process_job::SoVitsSvcProcessJobArgs;

pub async fn process_single_vc_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {

  let model_token = match job.maybe_model_token.as_deref() {
    Some(token) => token,
    None => {
      return Err(ProcessSingleJobError::InvalidJob(
        anyhow!("No model token for job: {:?}", job.inference_job_token)));
    }
  };

  // TODO: Interrogate cache (which also depends on other flags)
  let maybe_vc_model = get_voice_conversion_model_for_inference(
    &job_dependencies.mysql_pool, model_token)
      .await
      .map_err(|err| {
        ProcessSingleJobError::Other(anyhow!("database error: {:?}", err))
      })?;

  let vc_model = match maybe_vc_model {
    None => return Err(ProcessSingleJobError::Other(anyhow!("vc model not found: {:?}", model_token))),
    Some(model) => model,
  };

  // TODO: Look for model files on filesystem

  // TODO: Attempt to grab job lock

  let job_success_result = match vc_model.model_type {
    VoiceConversionModelType::SoftVc => {
      // TODO
      JobSuccessResult {
        maybe_result_entity: None,
      }
    }
    VoiceConversionModelType::SoVitsSvc => {
      so_vits_svc::process_job::process_job(SoVitsSvcProcessJobArgs {
        job_dependencies,
        job,
        vc_model: &vc_model,
      }).await?
    }
  };

  Ok(job_success_result)
}

