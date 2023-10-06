use std::fs::read_to_string;
use std::time::Instant;

use anyhow::anyhow;
use log::{error, info, warn};

use buckets::public::media_files::original_file::MediaFileBucketPath;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use filesys::file_size::file_size;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::insert_media_file_from_face_animation::{insert_media_file_from_face_animation, InsertArgs};
use tokens::users::user::UserToken;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;

//use crate::job::job_types::lipsync::sad_talker::download_audio_file::download_audio_file;
//use crate::job::job_types::lipsync::sad_talker::sad_talker_inference_command::InferenceArgs;
//use crate::job::job_types::lipsync::sad_talker::validate_job::validate_job;

use crate::job_dependencies::JobDependencies;

pub struct VALLEXProcessJobArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
  }

  pub async fn process_job(args: SadTalkerProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {

    // get job args and dependencies and execute them with the inputs
    let job = args.job;
    let deps = args.job_dependencies;

    let mut job_progress_reporter = args.job_dependencies
    .job_progress_reporter
    .new_generic_inference(job.inference_job_token.as_str())
    .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

    // validate the inputs on the job
    let job_args = validate_job(job)?;


    // Need to download the models
    info!("Download models (if not present)...");
    let mut i : usize = 0;
    for downloader in deps.job_type_details.sad_talker.downloaders.all_downloaders() {

        // Temporary debugging
        info!("Downloader {}", i);
        i = i + 1;

        let result = downloader.download_if_not_on_filesystem(
        &args.job_dependencies.private_bucket_client,
        &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads,
        ).await;

        if let Err(e) = result {
        error!("could not download: {:?}", e);
        return Err(ProcessSingleJobError::from_anyhow_error(e))
        }
    }

    // Download embeddings 
        
    //


  }