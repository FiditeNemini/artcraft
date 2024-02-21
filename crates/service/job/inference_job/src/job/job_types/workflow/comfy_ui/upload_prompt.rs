use std::fs::{File, read_to_string};
use std::path::{Path, PathBuf};
use std::time::{Duration};

use anyhow::{anyhow, Result};
use log::{debug, error, info, warn};
use serde_json::Value;
use tokio::io::AsyncWriteExt;
use walkdir::WalkDir;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use cloud_storage::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use enums::by_table::media_files::media_file_type::MediaFileType;
use filesys::check_file_exists::check_file_exists;
use filesys::file_size::file_size;
use filesys::path_to_string::path_to_string;
use filesys::safe_delete_temp_directory::safe_delete_temp_directory;
use filesys::safe_delete_temp_file::safe_delete_temp_file;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs::Cu;
use mysql_queries::payloads::generic_inference_args::workflow_payload::NewValue;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::create::insert_media_file_from_comfy_ui::{insert_media_file_from_comfy_ui, InsertArgs};
use mysql_queries::queries::media_files::get_media_file::get_media_file;
use mysql_queries::queries::model_weights::get::get_weight::get_weight_by_token;
use thumbnail_generator::task_client::thumbnail_task::ThumbnailTaskBuilder;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use crate::job::job_types::workflow::comfy_ui::process_job::ComfyProcessJobArgs;

fn get_file_extension(mimetype: &str) -> Result<&'static str> {
    let ext = match mimetype {
        "video/mp4" => "mp4",
        "image/png" => "png",
        "image/jpeg" => "jpg",
        "image/gif" => "gif",
        _ => return Err(anyhow!("Mimetype not supported: {}", mimetype)),
    };
    Ok(ext)
}

pub async fn upload_prompt(args: ComfyProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError>{
    let job = args.job;
    let deps = args.job_dependencies;

    Ok(JobSuccessResult {
        maybe_result_entity: Some(ResultEntity {
            entity_type: InferenceResultType::UploadModel,
            entity_token: "".to_string(),
        }),
        inference_duration: Duration::new(0, 0),
    })
}
