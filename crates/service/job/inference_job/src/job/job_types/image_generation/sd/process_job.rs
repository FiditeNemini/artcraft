
use std::time::Duration;
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use anyhow::anyhow;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;

pub struct StableDiffusionProcessArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

pub async fn prepare_inputs() {
    // download the required files and weights using the tokens
}

pub async fn validate_inputs(args: StableDiffusionProcessArgs<'_>) -> Result<(), ProcessSingleJobError> {
    // validate the inputs
    let model_dependencies = args.job_dependencies
    .job
    .job_specific_dependencies
    .maybe_stable_diffusion_dependencies
    .as_ref()
    .ok_or_else(|| ProcessSingleJobError::JobSystemMisconfiguration(Some("missing stable diffusion dependencies".to_string())))?;

    
    let inference_args = args.job.maybe_inference_args
    .as_ref()
    .map(|args| args.args.as_ref())
    .flatten();

    let args = match args {
        PolymorphicInferenceArgs::Ig(args) => args,
        _ => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
        }
    };

    let stable_diffusion_args: StableDiffusionArgs = StableDiffusionArgs::from(args.clone());

    if stable_diffusion_args.inference_type == "checkpoint" {
        
    } else if stable_diffusion_args.inference_type == "lora" {

    } else if stable_diffusion_args.inference_type == "inference" {
        
    } else {
        return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference type for job!")));
    }

    let args = match inference_args {
        Some(args) => args,
        None => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no inference args for job!")));
        }
    };

    let args = match args {
        PolymorphicInferenceArgs::Ig(args) => args,
        _ => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
        }
    };

    Ok(())
}

pub async fn process_job(args: StableDiffusionProcessArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let deps = args.job_dependencies;

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

    let polymorphic_args: StableDiffusionArgs = match polymorphic_args {
        PolymorphicInferenceArgs::Ig(args) => args,
        _ => {
            return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inner args for job!")));
        }
    };
    
    // let mut job_progress_reporter = args.job_dependencies
    //     .clients
    //     .job_progress_reporter
    //     .new_generic_inference(job.inference_job_token.as_str())
    //     .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

    // ==================== UNPACK + VALIDATE INFERENCE ARGS ==================== //
    let job_args = validate_inputs(args).await?;
    
    // ==================== TEMP DIR ==================== //
    let work_temp_dir = format!("temp_rerender_inference_{}", job.id.0);

    // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let work_temp_dir = args.job_dependencies
        .fs
        .scoped_temp_dir_creator_for_work
        .new_tempdir(&work_temp_dir)
        .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

    // validation 
    let stable_diffusion_args: StableDiffusionArgs = StableDiffusionArgs::from(polymorphic_args.clone());

    if stable_diffusion_args.inference_type == "checkpoint" {
        // run inference with checkpoint and upload
    } else if stable_diffusion_args.inference_type == "lora" {
        // run inference with the  lora + random checkpoint
    } else if stable_diffusion_args.inference_type == "inference" {
        // run inference with or without lora
    } else {
        return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference type for job!")));
    }

    // run inference
    
    // insert record into the db with the inference job token complete.

    Ok(JobSuccessResult {
         maybe_result_entity: None,
         inference_duration: Duration::from_secs(0),
    })
}