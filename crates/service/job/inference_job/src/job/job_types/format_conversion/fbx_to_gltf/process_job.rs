use std::fs::read_to_string;
use std::time::Instant;

use anyhow::anyhow;
use log::{error, info, warn};

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use enums::by_table::generic_synthetic_ids::id_category::IdCategory;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use filesys::check_file_exists::check_file_exists;
use filesys::file_size::file_size;
use filesys::safe_delete_temp_directory::safe_delete_temp_directory;
use filesys::safe_delete_temp_file::safe_delete_temp_file;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::create::insert_media_file_generic::{insert_media_file_generic, InsertArgs};
use mysql_queries::queries::media_files::get_media_file_for_inference::MediaFileForInference;
use subprocess_common::command_runner::command_runner_args::{FileOrCreate, RunAsSubprocessArgs};

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::format_conversion::fbx_to_gltf::command_args::FbxToGltfCommandArgs;
use crate::job_dependencies::JobDependencies;
use crate::util::maybe_download_file_from_bucket::{maybe_download_file_from_bucket, MaybeDownloadArgs};

const BUCKET_FILE_EXTENSION : &str = ".gltf";

pub struct FbxToGltfJobArgs<'a> {
  pub job_dependencies: &'a JobDependencies,
  pub job: &'a AvailableInferenceJob,
  pub media_file: &'a MediaFileForInference,
}

pub async fn process_job(args: FbxToGltfJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
  let job = args.job;
  let media_file = args.media_file;

  let mut job_progress_reporter = args.job_dependencies
      .clients
      .job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  let model_dependencies = args
      .job_dependencies
      .job
      .job_specific_dependencies
      .maybe_convert_fbx_to_gltf_dependencies
      .as_ref()
      .ok_or_else(|| ProcessSingleJobError::JobSystemMisconfiguration(Some("missing ConvertFbx2Gltf dependencies".to_string())))?;

  // ==================== TEMP DIR ==================== //

  let work_temp_dir = format!("temp_file_convert_{}", job.id.0);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let work_temp_dir = args.job_dependencies
      .fs
      .scoped_temp_dir_creator_for_work
      .new_tempdir(&work_temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  // ==================== DOWNLOAD MEDIA FILE ==================== //

  info!("Download media for conversion...");

  let original_media_upload_fs_path = {
    let original_media_file_fs_path = work_temp_dir.path().join("original.fbx");

    let media_file_bucket_path = MediaFileBucketPath::from_object_hash(
          &media_file.public_bucket_directory_hash,
          media_file.maybe_public_bucket_prefix.as_deref(),
          media_file.maybe_public_bucket_extension.as_deref());

    let bucket_object_path = media_file_bucket_path.to_full_object_pathbuf();

    info!("Downloading media to bucket path: {:?}", &bucket_object_path);

    maybe_download_file_from_bucket(MaybeDownloadArgs {
      name_or_description_of_file: "media upload (original file)",
      final_filesystem_file_path: &original_media_file_fs_path,
      bucket_object_path: &bucket_object_path,
      bucket_client: &args.job_dependencies.buckets.public_bucket_client,
      job_progress_reporter: &mut job_progress_reporter,
      job_progress_update_description: "downloading",
      job_id: job.id.0,
      scoped_tempdir_creator: &args.job_dependencies.fs.scoped_temp_dir_creator_for_work,
      maybe_existing_file_minimum_size_required: None,
    }).await?;

    original_media_file_fs_path
  };

  // ==================== SETUP FOR CONVERSION ==================== //

  job_progress_reporter.log_status("running conversion")
      .map_err(|e| ProcessSingleJobError::Other(e))?;


  // ==================== RUN INFERENCE SCRIPT ==================== //

  let stderr_output_file = work_temp_dir.path().join("stderr.txt");
  let output_directory = work_temp_dir.path().join("output");
  let output_directory_actual = work_temp_dir.path().join("output_out"); // NB: FBX2GLTF changes the directory name

  let execution_start_time = Instant::now();

  let command_exit_status = {
    model_dependencies
        .command_runner
        .run_with_subprocess(RunAsSubprocessArgs {
          args: Box::new(&FbxToGltfCommandArgs {
            input_file: &original_media_upload_fs_path,
            output_directory: &output_directory,
          }),
          maybe_stderr_output_file: Some(FileOrCreate::NewFileWithName(&stderr_output_file)),
          maybe_stdout_output_file: None,
        })
  };

  let execution_duration = Instant::now().duration_since(execution_start_time);

  info!("Execution took duration to complete: {:?}", &execution_duration);

  if !command_exit_status.is_success() {
    error!("Execution failed: {:?}", command_exit_status);

    let error = ProcessSingleJobError::Other(anyhow!("CommandExitStatus: {:?}", command_exit_status));

    if let Ok(contents) = read_to_string(&stderr_output_file) {
      warn!("Captured stderr output: {}", contents);

      //match categorize_error(&contents)  {
      //  Some(ProcessSingleJobError::FaceDetectionFailure) => {
      //    warn!("Face not detected in source image");
      //    error = ProcessSingleJobError::FaceDetectionFailure;
      //  }
      //  _ => {}
      //}
    }

    safe_delete_temp_file(&original_media_upload_fs_path);
    safe_delete_temp_directory(&output_directory_actual);
    safe_delete_temp_directory(&work_temp_dir);

    return Err(error);
  }

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  // NB: The actual name of the file will be this:
  let output_gltf_file = output_directory_actual.join("output.gltf"); // NB: FBX2GLTF creates multiple files in the directory

  info!("Checking that output files exist...");

  check_file_exists(&output_gltf_file).map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Interrogating result file properties...");

  let file_size_bytes = file_size(&output_gltf_file)
      .map_err(|err| ProcessSingleJobError::Other(err))?;

  let maybe_mimetype = get_mimetype_for_file(&output_gltf_file)
      .map_err(|err| ProcessSingleJobError::from_io_error(err))?
      .map(|mime| mime.to_string());

  info!("Calculating sha256...");

  let file_checksum = sha256_hash_file(&output_gltf_file)
      .map_err(|err| {
        ProcessSingleJobError::Other(anyhow!("Error hashing file: {:?}", err))
      })?;

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  job_progress_reporter.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let result_bucket_location = MediaFileBucketPath::generate_new(
    None,
    Some(BUCKET_FILE_EXTENSION));

  let result_bucket_object_pathbuf = result_bucket_location.to_full_object_pathbuf();

  info!("Destination bucket path: {:?}", &result_bucket_object_pathbuf);

  info!("Uploading media file...");

  args.job_dependencies.buckets.public_bucket_client.upload_filename_with_content_type(
    &result_bucket_object_pathbuf,
    &output_gltf_file,
    "audio/wav")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_gltf_file);
  safe_delete_temp_directory(&output_directory_actual);

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&work_temp_dir);

  // ==================== SAVE RECORDS ==================== //

  info!("Saving record...");

  let (inference_result_token, id) = insert_media_file_generic(InsertArgs {
    pool: &args.job_dependencies.db.mysql_pool,
    job: &job,
    media_type: MediaFileType::Gltf,
    origin_category: MediaFileOriginCategory::Processed,
    origin_product_category: MediaFileOriginProductCategory::Mocap,
    maybe_origin_model_type: None,
    maybe_origin_model_token: None,
    maybe_origin_filename: None,
    maybe_mime_type: maybe_mimetype.as_deref(),
    file_size_bytes,
    maybe_duration_millis: None,
    maybe_audio_encoding: None,
    maybe_video_encoding: None,
    maybe_frame_width: None,
    maybe_frame_height: None,
    public_bucket_directory_hash: result_bucket_location.get_object_hash(),
    maybe_public_bucket_prefix: result_bucket_location.get_optional_prefix(),
    maybe_public_bucket_extension: result_bucket_location.get_optional_extension(),
    extra_file_modification_info: None,
    maybe_creator_file_synthetic_id_category: IdCategory::MediaFile,
    maybe_creator_category_synthetic_id_category: IdCategory::MocapResult,
    maybe_mod_user_token: None,
    is_batch_generated: false,
    is_generated_on_prem: false,
    checksum_sha2: &file_checksum,
    generated_by_worker: Some(&args.job_dependencies.job.info.container.hostname),
    generated_by_cluster: Some(&args.job_dependencies.job.info.container.cluster_name),
  })
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("VC Done.");

  //args.job_dependencies.clients.firehose_publisher.vc_inference_finished(
  //  maybe_user_token.as_ref(),
  //  &job.inference_job_token,
  //  inference_result_token.as_str())
  //    .await
  //    .map_err(|e| {
  //      error!("error publishing event: {:?}", e);
  //      ProcessSingleJobError::Other(anyhow!("error publishing event"))
  //    })?;

  job_progress_reporter.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Job {:?} complete success! Downloaded, executed successfully, and uploaded. Saved record: {}, Result Token: {}",
        job.id, id, &inference_result_token);

  Ok(JobSuccessResult {
    maybe_result_entity: Some(ResultEntity {
      entity_type: InferenceResultType::MediaFile,
      entity_token: inference_result_token.to_string(),
    }),
    inference_duration: execution_duration,
  })
}
