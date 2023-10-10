use anyhow::anyhow;

use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::{job_loop::process_single_job_error::ProcessSingleJobError, job_types::lipsync::sad_talker::validate_job::JobArgs};

pub fn validate_job(job: &AvailableInferenceJob) -> Result<JobArgs, ProcessSingleJobError> {
  Err(ProcessSingleJobError::InvalidJob(anyhow!("job not yet written")))
}
