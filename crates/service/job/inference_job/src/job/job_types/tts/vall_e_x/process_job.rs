use anyhow::anyhow;
use log::{ error, info };
use std::time::Instant;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::job_success_result::JobSuccessResult;
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;

// This will download everything get into the root host OS then ... will invoke inference using the pathes from the files invoked
pub struct VALLEXProcessJobArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

// pub async fn download_voice_embedding_from_hash(object_path: str, 
//                                                 bucket_hash: str,
//                                                 private_bucket:&str) -> Result<> {
//     let paths = BucketPathUnifier::default_paths();
//     let object_path = paths(hash, 0);
//     let filesystem_path = format!("{}_weights.npz", name);
//     private_bucket_client.download_file_to_disk(object_path, filesystem_path).await?;
// }

// query using the token then grab the bucket hash
pub async fn process_job(
    args: VALLEXProcessJobArgs<'_>
) -> Result<JobSuccessResult, ProcessSingleJobError> {
    

    let job = args.job;
    let deps = args.job_dependencies;

        // get job args
        let text = match job.maybe_raw_inference_text { 
          Some(value) => value,
          None => {
            Err(ProcessSingleJobError::InvalidJob(anyhow!("Missing Text for Inference")))
          }
        };

    // get some globals
    let job_progress_reporter = deps.job_progress_reporter
        .new_generic_inference(job.inference_job_token.as_str())
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

    // validate the inputs
    // let job_args = validate_job(job)?;

    // Need to download the models
    info!("Download models (if not present)...");

    for downloader in deps.job_type_details.vall_e_x.downloaders.all_downloaders() {
        let result = downloader.download_if_not_on_filesystem(
            &args.job_dependencies.private_bucket_client,
            &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads
        ).await;

        if let Err(e) = result {
            error!("could not download: {:?}", e);
            return Err(ProcessSingleJobError::from_anyhow_error(e));
        }
    }

    // Download embeddings file using embedding token

    // run inference
    let work_temp_dir = format!("temp_zeroshot_inference_{}", job.id.0);
    // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let work_temp_dir = args.job_dependencies
        .fs
        .scoped_temp_dir_creator_for_work
        .new_tempdir(&work_temp_dir)
        .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

    // delete temp dir files

    // ==================== UPLOAD AUDIO TO BUCKET ==================== //
    let maybe_args = job.maybe_inference_args
    .as_ref()
    .map(|args| args.args.as_ref())
    .flatten();

    let workdir = work_temp_dir.path().to_path_buf();
    let stderr_output_file = work_temp_dir.path().join("stderr.txt");
    let inference_start_time = Instant::now();
  
    let command_exit_status = args.job_dependencies
        .job_type_details
        .vall_e_x
        .inference_command
        .execute_inference(InferenceArgs {
          input_embedding: , // name of the embedding.npz in the tmp dir
          input_text: , // name of the text
                         /// --result_file: path to final file output
          output_file_name: , // output file name in the output folder
          stderr_output_file: ,
        });

    // upload audio to public bucket ( for voice )
    // return ok
    // Err(ProcessSingleJobError::InvalidJob(anyhow!("this job flow is not yet implemented")))

}

#[cfg(test)]
mod test {
    #[test]
    fn values() {
        print!("{}", "Hello!");
    }
}
