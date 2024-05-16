use anyhow::anyhow;

use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::image_generation::sd::process_job::StableDiffusionProcessArgs;

pub async fn validate_inputs(args: StableDiffusionProcessArgs<'_>) -> Result<(), ProcessSingleJobError> {
    let inference_args = args.job.maybe_inference_args
    .as_ref()
    .map(|args| args.args.as_ref())
    .flatten();

    let polymorphic_args = match inference_args {
        Some(args) => args,
        None => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!")));
        }
    };

    let sd_args = match polymorphic_args {
        PolymorphicInferenceArgs::Ig(args) => args,
        _ => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
        }
    };

    let stable_diffusion_args: StableDiffusionArgs = StableDiffusionArgs::from(sd_args.clone());
    if stable_diffusion_args.type_of_inference == "checkpoint" {
        
    } else if stable_diffusion_args.type_of_inference == "lora" {

    } else if stable_diffusion_args.type_of_inference == "inference" {
        
    } else {
        return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference type for job!")));
    }



    Ok(())
}
