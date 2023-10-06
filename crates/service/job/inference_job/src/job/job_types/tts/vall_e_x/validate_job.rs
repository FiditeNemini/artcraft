use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::{job_types::lipsync::sad_talker::validate_job::JobArgs, job_loop::process_single_job_error::ProcessSingleJobError};



pub fn validate_job(job: &AvailableInferenceJob) -> Result<JobArgs,ProcessSingleJobError> {
    
}