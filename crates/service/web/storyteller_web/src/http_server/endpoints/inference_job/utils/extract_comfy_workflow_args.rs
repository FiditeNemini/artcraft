use anyhow::anyhow;

use errors::AnyhowResult;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;
use mysql_queries::payloads::generic_inference_args::workflow_payload::WorkflowArgs;
use mysql_queries::queries::generic_inference::web::job_status::GenericInferenceJobStatus;

use crate::http_server::endpoints::inference_job::utils::extract_polymorphic_inference_args::extract_polymorphic_inference_args;

pub fn extract_comfy_workflow_args(job: &GenericInferenceJobStatus) -> Option<WorkflowArgs> {
  extract_comfy_workflow_args_fallible(job).ok().flatten()
}

pub fn extract_comfy_workflow_args_fallible(job: &GenericInferenceJobStatus) -> AnyhowResult<Option<WorkflowArgs>> {
  let maybe_args = extract_polymorphic_inference_args(job)?;

  match maybe_args {
    Some(args) => match args {
      PolymorphicInferenceArgs::Cu(workflow_args) => Ok(Some(workflow_args.clone())),
      _ => return Err(anyhow!("wrong inner args for job!")),
    },
    None => {
      return Err(anyhow!("no args for job!"));
    }
  }
}
