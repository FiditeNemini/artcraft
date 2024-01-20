use std::fs::read_to_string;
use std::path::PathBuf;
use std::time::Instant;

use anyhow::anyhow;
use log::{error, info, warn};
use serde::de::Error;
use serde_json::Value;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use cloud_storage::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use enums::by_table::media_files::media_file_type::MediaFileType;
use filesys::check_file_exists::check_file_exists;
use filesys::file_size::file_size;
use filesys::safe_delete_temp_directory::safe_delete_temp_directory;
use filesys::safe_delete_temp_file::safe_delete_temp_file;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use jsonpath_lib::replace_with;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::PolymorphicInferenceArgs::Cu;
use mysql_queries::payloads::generic_inference_args::workflow_payload::NewValue;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::create::insert_media_file_from_comfy_ui::{insert_media_file_from_comfy_ui, InsertArgs};
use mysql_queries::queries::model_weights::get_weight::get_weight_by_token;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::comfy_ui::comfy_ui_inference_command::InferenceArgs;
use crate::job::job_types::workflow::comfy_ui::validate_job::validate_job;
use crate::job_dependencies::JobDependencies;

const BUCKET_FILE_PREFIX: &str = "fakeyou_";

pub struct ComfyProcessJobArgs<'a> {
    pub job_dependencies: &'a JobDependencies,
    pub job: &'a AvailableInferenceJob,
}

pub async fn process_job(args: ComfyProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
    let job = args.job;
    let deps = args.job_dependencies;

    let mut job_progress_reporter = args.job_dependencies
        .clients
        .job_progress_reporter
        .new_generic_inference(job.inference_job_token.as_str())
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

    let model_dependencies = args
        .job_dependencies
        .job
        .job_specific_dependencies
        .maybe_comfy_ui_dependencies
        .as_ref()
        .ok_or_else(|| ProcessSingleJobError::JobSystemMisconfiguration(Some("Missing ComfyUI dependencies".to_string())))?;

    // ==================== UNPACK + VALIDATE INFERENCE ARGS ==================== //

    let job_args = validate_job(job)?;

    // ==================== TEMP DIR ==================== //

    let work_temp_dir = format!("temp_comfy_inference{}", job.id.0);

    // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
    let work_temp_dir = args.job_dependencies
        .fs
        .scoped_temp_dir_creator_for_work
        .new_tempdir(&work_temp_dir)
        .map_err(|e| ProcessSingleJobError::from_io_error(e))?;


    // ==================== QUERY AND DOWNLOAD FILES ==================== //
    let root_comfy_path = model_dependencies.inference_command.comfy_root_code_directory.clone();

    let remote_cloud_file_client = RemoteCloudFileClient::get_remote_cloud_file_client().await;
    let remote_cloud_file_client = match remote_cloud_file_client {
        Ok(res) => {
            res
        }
        Err(_) => {
            return Err(ProcessSingleJobError::from(anyhow!("failed to get remote cloud file client")));
        }
    };

    // Download SD model if specified
    let mut maybe_sd_path: Option<PathBuf> = None;
    match job_args.maybe_sd_model {
        Some(sd_model) => {
            let sd_dir = root_comfy_path.join("models").join("checkpoints");
            let retrieved_sd_record =  get_weight_by_token(
                sd_model,
                false,
                &deps.db.mysql_pool
            ).await?.unwrap();

            let bucket_details = RemoteCloudBucketDetails {
                object_hash: retrieved_sd_record.public_bucket_hash,
                prefix: retrieved_sd_record.maybe_public_bucket_prefix.unwrap(),
                suffix: retrieved_sd_record.maybe_public_bucket_extension.unwrap(),
            };
            let sd_filename = retrieved_sd_record.original_filename.unwrap_or("sd_model.safetensors".to_string());
            let sd_path = sd_dir.join(sd_filename).to_str().unwrap().to_string();
            remote_cloud_file_client.download_file(bucket_details, sd_path.clone()).await?;
            maybe_sd_path = Some(sd_path.parse().unwrap());
            info!("Downloaded SD model to {:?}", sd_path);
        }
        None => {}
    }
    // Download Lora model if specified
    let mut maybe_lora_path: Option<PathBuf> = None;
    match job_args.maybe_lora_model {
        Some(lora_model) => {
            let lora_dir = root_comfy_path.join("models").join("checkpoints");
            let retrieved_lora_record =  get_weight_by_token(
                lora_model,
                false,
                &deps.db.mysql_pool
            ).await?.unwrap();
            let bucket_details = RemoteCloudBucketDetails {
                object_hash: retrieved_lora_record.public_bucket_hash,
                prefix: retrieved_lora_record.maybe_public_bucket_prefix.unwrap(),
                suffix: retrieved_lora_record.maybe_public_bucket_extension.unwrap(),
            };

            let lora_filename = retrieved_lora_record.original_filename.unwrap_or("lora_model.safetensors".to_string());
            let lora_path = lora_dir.join(lora_filename).to_str().unwrap().to_string();
            remote_cloud_file_client.download_file(bucket_details, lora_path.clone()).await?;
            maybe_lora_path = Some(lora_path.parse().unwrap());
            info!("Downloaded Lora model to {:?}", lora_path);
        }
        None => {}
    }

    // Download workflow to ComfyRunner
    let workflow_dir = root_comfy_path.join("../ComfyLauncher");
    let retrieved_workflow_record =  get_weight_by_token(
        job_args.workflow_source,
        false,
        &deps.db.mysql_pool
    ).await?.unwrap();

    let bucket_details = RemoteCloudBucketDetails {
        object_hash: retrieved_workflow_record.public_bucket_hash,
        prefix: retrieved_workflow_record.maybe_public_bucket_prefix.unwrap(),
        suffix: retrieved_workflow_record.maybe_public_bucket_extension.unwrap(),
    };
    let workflow_path = workflow_dir.join("prompt.json").to_str().unwrap().to_string();
    remote_cloud_file_client.download_file(bucket_details, workflow_path.clone()).await?;

    let maybe_args = job.maybe_inference_args
        .as_ref()
        .map(|args| args.args.as_ref())
        .flatten();

    let poly_args = match maybe_args {
        None => return Err(ProcessSingleJobError::Other(anyhow!("ComfyUi args not found"))),
        Some(args) => args,
    };

    let comfy_args = match poly_args {
        Cu(args) => args,
        _ => return Err(ProcessSingleJobError::Other(anyhow!("ComfyUi args not found"))),
    };

    // Apply modifications if they exist
    if let Some(modifications) = comfy_args.maybe_json_modifications.clone() {
        // Load prompt.json
        let prompt_file = std::fs::File::open(&workflow_path).unwrap();
        let mut prompt_json: Value = serde_json::from_reader(prompt_file).unwrap();
        // Modify json
        for (path, new_value) in modifications {
            prompt_json = replace_json_value(prompt_json, &path, new_value).expect(
                format!("Failed to replace json value at path {}", path).as_str()
            );
        }
        // Save prompt.json
        let prompt_file = std::fs::File::create(&workflow_path).unwrap();
        serde_json::to_writer(prompt_file, &prompt_json).unwrap();
    }

    // ==================== SETUP FOR INFERENCE ==================== //

    info!("Ready for ComfyUI inference...");

    job_progress_reporter.log_status("running inference")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("Running ComfyUI inference...");

    // ==================== RUN INFERENCE SCRIPT ==================== //
    let stderr_output_file = work_temp_dir.path().join("stderr.txt");
    let inference_start_time = Instant::now();

    let command_exit_status = model_dependencies
        .inference_command
        .execute_inference(InferenceArgs {
            stderr_output_file: &stderr_output_file,
        });

    let inference_duration = Instant::now().duration_since(inference_start_time);

    info!("Inference took duration to complete: {:?}", &inference_duration);

    if !command_exit_status.is_success() {
        error!("Inference failed: {:?}", command_exit_status);

        let error = ProcessSingleJobError::Other(anyhow!("CommandExitStatus: {:?}", command_exit_status));

        if let Ok(contents) = read_to_string(&stderr_output_file) {
            warn!("Captured stderr output: {}", contents);
        }

        safe_delete_temp_file(&stderr_output_file);
        safe_delete_temp_directory(&work_temp_dir);
        safe_delete_temp_file(&workflow_path);
        if let Some(sd_path) = maybe_sd_path {
            safe_delete_temp_file(&sd_path);
        }
        if let Some(lora_path) = maybe_lora_path {
            safe_delete_temp_file(&lora_path);
        }

        return Err(error);
    }

    // ==================== GET OUTPUT FILE ======================== //

    // take the latest file in the output directory
    let output_dir = root_comfy_path.join("output");
    let mut entries: Vec<PathBuf> = std::fs::read_dir(output_dir).unwrap()
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, std::io::Error>>()
        .unwrap();

    entries.sort_by_key(|path| std::fs::metadata(path).unwrap().modified().unwrap());


    // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

    // check if entries is empty
    if entries.is_empty() {
        return Err(ProcessSingleJobError::Other(anyhow!("No output files found")));
    }
    let finished_file = entries.last().unwrap();
    info!("Checking that file exists: {:?} ...", finished_file);
    check_file_exists(&finished_file).map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("Interrogating result file size ...");

    let file_size_bytes = file_size(&finished_file)
        .map_err(|err| ProcessSingleJobError::Other(err))?;

    info!("Interrogating result mimetype ...");

    let mimetype = get_mimetype_for_file(&finished_file)
        .map_err(|err| ProcessSingleJobError::from_io_error(err))?
        .map(|mime| mime.to_string())
        .ok_or(ProcessSingleJobError::Other(anyhow!("Mimetype could not be determined")))?;

    // create ext from mimetype
    let ext = match mimetype.as_str() {
        "video/mp4" => ".mp4",
        "image/png" => ".png",
        "image/jpeg" => ".jpg",
        _ => return Err(ProcessSingleJobError::Other(anyhow!("Mimetype not supported: {}", mimetype))),
    };

    // determine media type from mime type
    let media_type = match mimetype.as_str() {
        "video/mp4" => MediaFileType::Video,
        "image/png" => MediaFileType::Image,
        "image/jpeg" => MediaFileType::Image,
        _ => return Err(ProcessSingleJobError::Other(anyhow!("Mimetype not supported: {}", mimetype))),
    };

    info!("Calculating sha256...");

    let file_checksum = sha256_hash_file(&finished_file)
        .map_err(|err| {
            ProcessSingleJobError::Other(anyhow!("Error hashing file: {:?}", err))
        })?;

    // ==================== UPLOAD VIDEO TO BUCKET ==================== //

    job_progress_reporter.log_status("uploading result")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    let result_bucket_location = MediaFileBucketPath::generate_new(
        Some(BUCKET_FILE_PREFIX),
        Some(ext));

    let result_bucket_object_pathbuf = result_bucket_location.to_full_object_pathbuf();

    info!("Output file destination bucket path: {:?}", &result_bucket_object_pathbuf);

    info!("Uploading media ...");

    args.job_dependencies.buckets.public_bucket_client.upload_filename_with_content_type(
        &result_bucket_object_pathbuf,
        &finished_file,
        &mimetype) // TODO: We should check the mimetype to make sure bad payloads can't get uploaded
        .await
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    // ==================== DELETE TEMP FILES ==================== //

    safe_delete_temp_file(&stderr_output_file);

    // delete all files in output directory
    let output_dir = root_comfy_path.join("output");
    let entries: Vec<PathBuf> = std::fs::read_dir(output_dir).unwrap()
        .map(|res| res.map(|e| e.path()))
        .collect::<Result<Vec<_>, std::io::Error>>()
        .unwrap();
    for entry in entries {
        safe_delete_temp_file(&entry);
    }

    // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
    safe_delete_temp_directory(&work_temp_dir);

    // ==================== SAVE RECORDS ==================== //

    info!("Saving ComfyUI result (media_files table record) ...");

    let (media_file_token, id) = insert_media_file_from_comfy_ui(InsertArgs {
        pool: &args.job_dependencies.db.mysql_pool,
        job: &job,
        maybe_mime_type: Some(&mimetype),
        file_size_bytes,
        sha256_checksum: &file_checksum,
        public_bucket_directory_hash: result_bucket_location.get_object_hash(),
        maybe_public_bucket_prefix: Some(BUCKET_FILE_PREFIX),
        maybe_public_bucket_extension: Some(ext),
        is_on_prem: args.job_dependencies.job.info.container.is_on_prem,
        worker_hostname: &args.job_dependencies.job.info.container.hostname,
        worker_cluster: &args.job_dependencies.job.info.container.cluster_name,
        media_file_type: media_type,
    })
        .await
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("ComfyUI Done.");

    job_progress_reporter.log_status("done")
        .map_err(|e| ProcessSingleJobError::Other(e))?;

    info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id, id, &media_file_token);

    Ok(JobSuccessResult {
        maybe_result_entity: Some(ResultEntity {
            entity_type: InferenceResultType::MediaFile,
            entity_token: media_file_token.to_string(),
        }),
        inference_duration,
    })
}

fn replace_json_value(json: Value, path: &str, new_value: NewValue) -> Result<Value, serde_json::Error> {
    replace_with(json, path, &mut |_| {
        match &new_value {
            NewValue::String(s) => Some(Value::String(s.clone())),
            NewValue::Float(f) => Some(Value::Number(serde_json::Number::from_f64(*f as f64).unwrap())),
            NewValue::Int(i) => Some(Value::Number(serde_json::Number::from(*i))),
            NewValue::Bool(b) => Some(Value::Bool(*b)),
        }
    }).map_err(|err| {
        serde_json::Error::custom(format!("Failed to replace json value at path {}: {:?}", path, err))
    })
}