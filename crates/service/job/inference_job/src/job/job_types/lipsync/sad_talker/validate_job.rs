use anyhow::anyhow;

use mysql_queries::payloads::generic_inference_args::generic_inference_args::{InferenceCategoryAbbreviated, PolymorphicInferenceArgs};
use mysql_queries::payloads::generic_inference_args::lipsync_payload::{LipsyncAnimationAudioSource, LipsyncAnimationImageSource};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;

pub struct JobArgs<'a> {
  pub audio_source: &'a LipsyncAnimationAudioSource,
  pub image_source: &'a LipsyncAnimationImageSource,
}

pub fn validate_job(job: &AvailableInferenceJob) -> Result<JobArgs, ProcessSingleJobError> {
  let inference_args = job.maybe_inference_args
      .as_ref()
      .map(|args| args.args.as_ref())
      .flatten();

  let inference_category = job.maybe_inference_args
      .as_ref()
      .map(|args| args.inference_category)
      .flatten();

  match inference_category {
    Some(InferenceCategoryAbbreviated::LipsyncAnimation) => {}, // Valid
    Some(category) => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference category for job: {:?}", category)));
    },
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference category for job!")));
    }
  };

  let inference_args = match inference_args {
    Some(args) => args,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!")));
    }
  };

  let inference_args = match inference_args {
    PolymorphicInferenceArgs::La(inference_args) => inference_args,
    _ => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
    }
  };

  let image_source = match &inference_args.maybe_image_source {
    Some(args) => args,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no video source!")));
    }
  };

  let audio_source = match &inference_args.maybe_audio_source {
    Some(args) => args,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no audio source!")));
    }
  };

  Ok(JobArgs {
    audio_source,
    image_source,
  })
}