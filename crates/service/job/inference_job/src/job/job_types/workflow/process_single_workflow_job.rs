use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::get_workflow_args_from_job::get_workflow_args_from_job;
use crate::job::job_types::workflow::upload_workflow;
use crate::job::job_types::workflow::video_style_transfer;
use crate::job_dependencies::JobDependencies;

pub async fn process_single_workflow_job(
  job_dependencies: &JobDependencies,
  job: &AvailableInferenceJob
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  let workflow_args = get_workflow_args_from_job(&job)?;

  let job_success_result = match workflow_args.maybe_google_drive_link {
    Some(_link) => {
      upload_workflow::process_upload_workflow_job::process_upload_workflow_job(job_dependencies, job).await?
    }
    None => {
      video_style_transfer::process_video_style_transfer_job::process_video_style_transfer_job(job_dependencies, job).await?
    }
  };

  Ok(job_success_result)
}
