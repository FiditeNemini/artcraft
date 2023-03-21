use errors::AnyhowResult;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_steps::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;

pub async fn process_single_vc_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> Result<(), ProcessSingleJobError> {
  Ok(())
}

