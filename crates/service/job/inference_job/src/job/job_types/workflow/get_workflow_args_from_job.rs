use errors::anyhow;
use mysql_queries::payloads::generic_inference_args::{generic_inference_args::PolymorphicInferenceArgs, workflow_payload::WorkflowArgs};
use mysql_queries::payloads::generic_inference_args::generic_inference_args::GenericInferenceArgs;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::comfy_process_job_args::ComfyProcessJobArgs;

pub fn get_workflow_args_from_job(
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
