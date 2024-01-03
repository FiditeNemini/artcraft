
use std::time::Duration;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;

pub struct SDProcessArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}
pub async fn process_job(args: SDProcessArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
    Ok(JobSuccessResult {
         maybe_result_entity: None,
         inference_duration: Duration::from_secs(0),
    })
}