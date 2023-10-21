use anyhow::anyhow;

use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use enums::by_table::tts_models::tts_model_type::TtsModelType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::get_tts_model_for_inference_improved;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::tts::{tacotron2_v2_early_fakeyou, vits};
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::process_job::ProcessJobArgs;
use crate::job::job_types::tts::vall_e_x::process_job::VALLEXProcessJobArgs;
use crate::job::job_types::tts::vits::process_job::VitsProcessJobArgs;
use crate::job_dependencies::JobDependencies;

use super::vall_e_x;

pub async fn process_single_tts_job(
    job_dependencies: &JobDependencies,
    job: &AvailableInferenceJob
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  // TODO: Move common checks for slurs, etc. here.

  match job.maybe_model_type {
    Some(InferenceModelType::VallEX) => {
      // Zero-shot TTS does not need a fine-tuned model token.
      dispatch_zero_shot_model(
        job_dependencies,
        job
      ).await
    },
    Some(InferenceModelType::Tacotron2 | InferenceModelType::Vits) => {
      // All other TTS types require a fine-tuned TTS database record.
      let raw_inference_text = job.maybe_raw_inference_text
      .as_deref()
      .ok_or(ProcessSingleJobError::Other(anyhow!("no inference text")))?;
  
      dispatch_fine_tuned_weights_model(
        job_dependencies,
        job,
        &raw_inference_text
      ).await
    }
    Some(other_model_type) => {
      Err(ProcessSingleJobError::Other(anyhow!("wrong model type for TTS: {:?}", other_model_type)))
    }
    None => {
      Err(ProcessSingleJobError::Other(anyhow!("tts model type not set")))
    }
  }
}

async fn dispatch_zero_shot_model(
    job_dependencies: &JobDependencies,
    job: &AvailableInferenceJob,
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  match job.maybe_model_type {
    Some(InferenceModelType::VallEX) => {
      vall_e_x::process_job::process_job(VALLEXProcessJobArgs {
        job_dependencies,
        job,
      }).await
    }
    _ => {
      Err(ProcessSingleJobError::Other(anyhow!("not a zero-shot model")))
    }
  }
}

async fn dispatch_fine_tuned_weights_model(
  job_dependencies: &JobDependencies,
  job: &AvailableInferenceJob,
  raw_inference_text: &str,
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  let tts_model_token = job.maybe_model_token
      .as_deref()
      .ok_or(ProcessSingleJobError::Other(anyhow!("no model token on job")))?;

  // TODO(bt,2023-10-09): Interrogate TTS model cache before querying database.
  let maybe_tts_model = get_tts_model_for_inference_improved(
    &job_dependencies.mysql_pool,
    tts_model_token,
  ).await.map_err(|err| ProcessSingleJobError::Other(anyhow!("database error: {:?}", err)))?;

  let tts_model = match maybe_tts_model {
    None => {
      return Err(ProcessSingleJobError::Other(anyhow!("tts model not found: {:?}", tts_model_token)));
    },
    Some(tts_model) => tts_model,
  };

  match tts_model.tts_model_type {
    TtsModelType::Tacotron2 => {
      tacotron2_v2_early_fakeyou::process_job::process_job(ProcessJobArgs {
          job_dependencies,
          job,
          tts_model: &tts_model,
          raw_inference_text,
      }).await
    }
    TtsModelType::Vits => {
      vits::process_job::process_job(VitsProcessJobArgs {
          job_dependencies,
          job,
          tts_model: &tts_model,
          raw_inference_text,
      }).await
    }
  }
}
