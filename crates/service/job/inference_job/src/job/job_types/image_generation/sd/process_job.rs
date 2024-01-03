
use std::time::Duration;
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use anyhow::anyhow;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;
pub struct SDProcessArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

pub async fn process_job(args: SDProcessArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {

    // validation 
    let inference_args = args.job.maybe_inference_args
        .as_ref()
        .map(|args| args.args.as_ref())
        .flatten();

    let args = match inference_args {
        Some(args) => args,
        None => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!")));
        }
    };

    let args = match args {
        PolymorphicInferenceArgs::Ig(args) => args,
        _ => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
        }
    };
    

    let stable_diffusion_args: StableDiffusionArgs = StableDiffusionArgs::from(args.clone());

    Ok(JobSuccessResult {
         maybe_result_entity: None,
         inference_duration: Duration::from_secs(0),
    })
}