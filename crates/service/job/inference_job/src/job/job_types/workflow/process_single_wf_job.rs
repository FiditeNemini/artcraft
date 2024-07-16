use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::comfy_process_job_args::ComfyProcessJobArgs;
use crate::job::job_types::workflow::get_workflow_args_from_job::get_workflow_args_from_job;
use crate::job::job_types::workflow::upload_workflow;
use crate::job::job_types::workflow::video_style_transfer;
use crate::job_dependencies::JobDependencies;

pub async fn process_single_wf_job(
  job_dependencies: &JobDependencies,
  job: &AvailableInferenceJob
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  let args = ComfyProcessJobArgs {
    job_dependencies,
    job,
  };

  let workflow_args = get_workflow_args_from_job(&args)?;

  let job_success_result = match workflow_args.maybe_google_drive_link {
    Some(_link) => {
      upload_workflow::upload_prompt::upload_prompt(args).await?
    }
    None => {
      video_style_transfer::process_job::process_job(args).await?
    }
  };

  Ok(job_success_result)
}
