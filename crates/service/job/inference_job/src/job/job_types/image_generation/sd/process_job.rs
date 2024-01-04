
use std::time::Duration;
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use anyhow::anyhow;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use crate::job::job_types::image_generation::sd::validate_inputs::validate_inputs;

pub struct StableDiffusionProcessArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

// fill out sd diffusion dependencies
// get specific weight 
// download weight / lora
// run inference
// upload inference result
// upload model checkpoint or loRA 
// create record in db
    // if stable_diffusion_args.inference_type == "checkpoint" {
    //     // run inference with checkpoint and upload
    // } else if stable_diffusion_args.inference_type == "lora" {
    //     // run inference with the  lora + random checkpoint
    // } else if stable_diffusion_args.inference_type == "inference" {
    //     // run inference with or without lora
    // } else {
    //     return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("wrong inference type for job!")));
    // }
    // run inference
    // insert record into the db with the inference job token complete.

pub async fn sd_args_from_job(args: &StableDiffusionProcessArgs<'_>) -> Result<StableDiffusionArgs, ProcessSingleJobError> {
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
    Ok(stable_diffusion_args)
}

pub async fn process_job(args: StableDiffusionProcessArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let deps = args.job_dependencies;

    let sd_args = sd_args_from_job(&args).await?;
    
    let mut job_progress_reporter = args.job_dependencies
        .clients
        .job_progress_reporter
        .new_generic_inference(job.inference_job_token.as_str())
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

    //==================== TEMP DIR ==================== //
    let work_temp_dir = format!("temp_stable_diffusion_inference_{}", job.id.0);

    //NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let work_temp_dir = args.job_dependencies
        .fs
        .scoped_temp_dir_creator_for_work
        .new_tempdir(&work_temp_dir)
        .map_err(|e| ProcessSingleJobError::from_io_error(e))?;



    Ok(JobSuccessResult {
         maybe_result_entity: None,
         inference_duration: Duration::from_secs(0),
    })
}