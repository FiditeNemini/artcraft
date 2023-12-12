use anyhow::anyhow;

use mysql_queries::payloads::generic_inference_args::generic_inference_args::{InferenceCategoryAbbreviated, PolymorphicInferenceArgs};
use mysql_queries::payloads::generic_inference_args::videofilter_payload::{VideofilterVideoSource};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;

pub struct JobArgs<'a> {
  pub video_source: &'a VideofilterVideoSource,
  pub sd_model: &'a str,
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
    Some(InferenceCategoryAbbreviated::RerenderAVideo) => {}, // Valid
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
    PolymorphicInferenceArgs::Rr(inference_args) => inference_args,
    _ => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
    }
  };

  let video_source = match &inference_args.maybe_video_source {
    Some(args) => args,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no video source!")));
    }
  };

  let sd_model = match &inference_args.maybe_sd_model {
    Some(args) => args,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no sd model!")));
    }
  };


  // let preprocess = match inference_args.maybe_preprocess {
  //   None => Some("full".to_string()),
  //   Some(Preprocess::F) => Some("full".to_string()),
  //   Some(Preprocess::EF) => Some("extfull".to_string()),
  //   Some(Preprocess::C) => Some("crop".to_string()),
  //   Some(Preprocess::EC) => Some("extcrop".to_string()),
  // };
  //
  // let enhancer = match inference_args.maybe_face_enhancer {
  //   None => None,
  //   Some(FaceEnhancer::G) => Some("gfpgan".to_string()),
  //   Some(FaceEnhancer::R) => Some("RestoreFormer".to_string()),
  // };
  //
  // let mut width = inference_args.maybe_resize_width;
  // let mut height = inference_args.maybe_resize_height;

  Ok(JobArgs {
    video_source,
    sd_model,
  })
}
