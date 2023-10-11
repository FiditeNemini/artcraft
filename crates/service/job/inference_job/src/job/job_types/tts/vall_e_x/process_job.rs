use anyhow::anyhow;
use log::{error, info};

use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;

// This will download everything get into the root host OS then ... will invoke inference using the pathes from the files invoked
pub struct VALLEXProcessJobArgs<'a> {
  pub job_dependencies: &'a JobDependencies,
  pub job: &'a AvailableInferenceJob,
}

pub async fn process_job(args: VALLEXProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {

  // get job args and dependencies and execute them with the inputs
  let job = args.job;
  let deps = args.job_dependencies;

  let job_progress_reporter = args.job_dependencies
    .job_progress_reporter
    .new_generic_inference(job.inference_job_token.as_str())
    .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  // validate the inputs 
  //let job_args = validate_job(job)?;

  // Need to download the models
  info!("Download models (if not present)...");

  for downloader in deps.job_type_details.vall_e_x.downloaders.all_downloaders() {
    let result = downloader.download_if_not_on_filesystem(
      &args.job_dependencies.private_bucket_client,
      &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads,
    ).await;

    if let Err(e) = result {
      error!("could not download: {:?}", e);
      return Err(ProcessSingleJobError::from_anyhow_error(e))
    }
  }

  // Download embeddings file using embedding token
  println!("");



  // Create a temp dir to download things to

  
  // run inference

  // upload audio to bucket

  // deletetemp dir files

  // save result ?


   // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  Err(ProcessSingleJobError::InvalidJob(anyhow!("this job flow is not yet implemented")))
}


  #[cfg(test)]
  mod test {
    #[test]
    fn values() {
      print!("{}","Hello!");
    }
  }