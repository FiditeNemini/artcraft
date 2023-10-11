use anyhow::anyhow;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{InferenceCategoryAbbreviated, PolymorphicInferenceArgs};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;


pub struct JobArgs {
  voice_token: &String 
}

pub fn validate_job(job: &AvailableInferenceJob) -> Result<JobArgs, ProcessSingleJobError> {
  let inference_category = job.maybe_inference_args.as_ref()
  .map(|args|args.inference_category)
  .flatten();

  match inference_category {
      Some(InferenceCategoryAbbreviated::TextToSpeech) => {},
      Some(category) => {
        return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference category for job: {:?}", category)));
      },
      None => {
        return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference category for job!")));
      }
  };

  let inference_args = job.maybe_inference_args
  .as_ref()
  .map(|args| args.args.as_ref())
  .flatten();

  let inference_args = match inference_args {
    Some(args) => args,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!")));
    }
  };

  let ttsArgs = match inference_args {
    PolymorphicInferenceArgs::Tts(inference_args) => inference_args,
    _ => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
    }
  };

  Ok(JobArgs {
    voice_token: ttsArgs.voice_token.as_str()
  });

}
