use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::image_generation::sd::process_job::process_job;
use crate::job_dependencies::JobDependencies;
use crate::job::job_types::image_generation::sd::process_job::StableDiffusionProcessArgs;
use errors::anyhow;

pub async fn process_single_ig_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = job;
    match job.maybe_model_type {
        Some(InferenceModelType::StableDiffusion) => {
            dispatch_sd_job(
            job_dependencies,
            job
          ).await
        },
        Some(other_model_type) => {
          Err(ProcessSingleJobError::Other(anyhow!("Wrong model type for SD: {:?}", other_model_type)))
        }
        None => {
          Err(ProcessSingleJobError::Other(anyhow!("SD model type not set")))
        }
      }
}

pub async fn dispatch_sd_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let args = StableDiffusionProcessArgs {
        job_dependencies,
        job,
    };
    process_job(args).await
}