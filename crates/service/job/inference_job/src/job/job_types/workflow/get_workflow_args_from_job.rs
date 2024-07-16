use errors::anyhow;
use mysql_queries::payloads::generic_inference_args::{generic_inference_args::PolymorphicInferenceArgs, workflow_payload::WorkflowArgs};
use mysql_queries::payloads::generic_inference_args::generic_inference_args::GenericInferenceArgs;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;

pub fn get_workflow_args_from_job(
  job: &AvailableInferenceJob,
) -> Result<WorkflowArgs, ProcessSingleJobError> {

  let inference_args = job.maybe_inference_args
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
