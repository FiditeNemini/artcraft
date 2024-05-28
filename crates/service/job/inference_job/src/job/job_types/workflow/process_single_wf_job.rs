use errors::anyhow;
use mysql_queries::{payloads::generic_inference_args::{generic_inference_args::PolymorphicInferenceArgs, workflow_payload::WorkflowArgs}, queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob};
use mysql_queries::payloads::generic_inference_args::generic_inference_args::GenericInferenceArgs;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::comfy_ui;
use crate::job::job_types::workflow::comfy_ui::comfy_process_job_args::ComfyProcessJobArgs;
use crate::job_dependencies::JobDependencies;

pub async fn get_workflow_args_from_job(
    args: &ComfyProcessJobArgs<'_>
) -> Result<WorkflowArgs, ProcessSingleJobError> {
    let inference_args = args.job.maybe_inference_args
        .as_ref()
        .map(|args: &GenericInferenceArgs| args.args.as_ref())
        .flatten();

    let polymorphic_args = match inference_args {
        Some(args) => args,
        None => {
            return Err(
                ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!"))
            );
        }
    };

    let some_args = match polymorphic_args {
        PolymorphicInferenceArgs::Cu(args) => args,
        _ => {
            return Err(
                ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!"))
            );
        }
    };
    
    let args: WorkflowArgs = WorkflowArgs::from(some_args.clone());

    Ok(args)
}

pub async fn process_single_wf_job(job_dependencies: &JobDependencies, 
                                   job: &AvailableInferenceJob) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let args: ComfyProcessJobArgs = ComfyProcessJobArgs {
        job_dependencies,
        job,
    };

    let workflow_args = get_workflow_args_from_job(&args).await?;

    // pass link in and download 
    match workflow_args.maybe_google_drive_link {
        Some(_link) => {
            let job_success_result = comfy_ui::upload_workflow::upload_prompt::upload_prompt(
                args
            ).await?;
            Ok(job_success_result)
        }
        None => {
            let job_success_result = comfy_ui::video_style_transfer::process_job::process_job(
                args
            ).await?;
            Ok(job_success_result)
        }
    }
}
