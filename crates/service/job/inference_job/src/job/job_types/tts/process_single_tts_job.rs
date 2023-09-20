use anyhow::anyhow;

use enums::by_table::tts_models::tts_model_type::TtsModelType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::get_tts_model_for_inference_improved;
use tokens::tokens::tts_models::TtsModelToken;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::tts::{tacotron2_v2_early_fakeyou, vits};
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::process_job::ProcessJobArgs;
use crate::job::job_types::tts::vits::process_job::VitsProcessJobArgs;
use crate::job_dependencies::JobDependencies;

pub async fn process_single_tts_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {

  let tts_model_token = match job.maybe_model_token.as_deref() {
    None => return Err(ProcessSingleJobError::Other(anyhow!("no model token on job"))),
    Some(model_token) => TtsModelToken::new_from_str(model_token),
  };

  // TODO: Move common checks for slurs, etc. here.

  let raw_inference_text = job.maybe_raw_inference_text
      .as_deref()
      .ok_or(ProcessSingleJobError::Other(anyhow!("no inference text")))?;

  // TODO: Interrogate cache (which also depends on other flags)
  let maybe_tts_model = get_tts_model_for_inference_improved(
    &job_dependencies.mysql_pool, tts_model_token.as_str())
      .await
      .map_err(|err| ProcessSingleJobError::Other(anyhow!("database error: {:?}", err)))?;

// TODO: Attempt to grab job lock

//  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //
//
//  info!("Attempting to grab lock for job: {}", job.inference_job_token);
//
//  let lock_acquired =
//      mark_tts_inference_job_pending_and_grab_lock(&job_args.mysql_pool, job.id)
//          .await
//          .map_err(|e| ProcessSingleJobError::Other(e))?;
//
//  if !lock_acquired {
//    warn!("Could not acquire job lock for: {:?}", &job.id);
//    let duration = start.elapsed();
//
//    since_creation_span.set_attribute("status", "failure");
//    since_creation_span.set_duration(duration);
//
//    job_iteration_span.set_attribute("status", "failure");
//    job_iteration_span.set_duration(duration);
//
//    return Ok((since_creation_span, job_iteration_span));
//  }
//
//  info!("Lock acquired for job: {}", job.inference_job_token);

  let tts_model = match maybe_tts_model {
    None => return Err(ProcessSingleJobError::Other(anyhow!("tts model not found: {:?}", tts_model_token))),
    Some(model) => model,
  };

  let job_success_result = match tts_model.tts_model_type {
    TtsModelType::Tacotron2 => {
      tacotron2_v2_early_fakeyou::process_job::process_job(ProcessJobArgs {
        job_dependencies,
        job,
        tts_model: &tts_model,
        raw_inference_text,
      }).await?
    }
    TtsModelType::Vits => {
      vits::process_job::process_job(VitsProcessJobArgs {
        job_dependencies,
        job,
        tts_model: &tts_model,
        raw_inference_text,
      }).await?
    }
  };

  Ok(job_success_result)
}

