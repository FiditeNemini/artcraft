use anyhow::anyhow;
use buckets::public::media_uploads::original_file::MediaUploadOriginalFilePath;
use buckets::public::voice_conversion_results::original_file::VoiceConversionResultOriginalFilePath;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::lipsync::sad_talker::download_audio_file::download_audio_file;
use crate::job::job_types::lipsync::sad_talker::download_image_file::download_image_file;
use crate::job::job_types::lipsync::sad_talker::validate_job::validate_job;
use crate::job::job_types::vc::rvc_v2::rvc_v2_inference_command::InferenceArgs;
use crate::job_dependencies::JobDependencies;
use crate::util::maybe_download_file_from_bucket::maybe_download_file_from_bucket;
use crate::util::model_downloader::ModelDownloader;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use errors::AnyhowResult;
use filesys::create_dir_all_if_missing::create_dir_all_if_missing;
use filesys::file_size::file_size;
use log::{error, info, warn};
use media::decode_basic_audio_info::decode_basic_audio_file_info;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{GenericInferenceArgs, InferenceCategoryAbbreviated, PolymorphicInferenceArgs};
use mysql_queries::payloads::generic_inference_args::lipsync_payload::{LipsyncAnimationAudioSource, LipsyncAnimationImageSource};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::voice_conversion::results::get_voice_conversion_result_for_inference::get_voice_conversion_result_for_inference;
use mysql_queries::queries::voice_conversion::results::insert_voice_conversion_result::{insert_voice_conversion_result, InsertArgs};
use std::path::PathBuf;
use std::thread;
use std::time::{Duration, Instant};
use tokens::users::user::UserToken;

pub struct SadTalkerProcessJobArgs<'a> {
  pub job_dependencies: &'a JobDependencies,
  pub job: &'a AvailableInferenceJob,
}

pub async fn process_job(args: SadTalkerProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
  let job = args.job;
  let deps = args.job_dependencies;

  let mut job_progress_reporter = args.job_dependencies
      .job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  // ==================== UNPACK + VALIDATE INFERENCE ARGS ==================== //

  let job_args = validate_job(job)?;

  // ==================== CONFIRM OR DOWNLOAD SAD TALKER MODELS (SEVERAL) ==================== //

  info!("Download models (if not present)...");

  for downloader in deps.job_type_details.sad_talker.downloaders.all_downloaders() {
    let result = downloader.download_if_not_on_filesystem(
      &args.job_dependencies.private_bucket_client,
      &args.job_dependencies.fs.scoped_temp_dir_creator_for_downloads,
    ).await;

    if let Err(e) = result {
      error!("could not download: {:?}", e);
      return Err(ProcessSingleJobError::from_anyhow_error(e))
    }
  }

  // ==================== TEMP DIR ==================== //

  let work_temp_dir = format!("temp_rvc_v2_inference_{}", job.id.0);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let work_temp_dir = args.job_dependencies
      .fs
      .scoped_temp_dir_creator_for_work
      .new_tempdir(&work_temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;


  // ==================== QUERY AND DOWNLOAD FILES ==================== //

  let audio_bucket_path= download_audio_file(
    &job_args.audio_source,
    &args.job_dependencies.public_bucket_client,
    &mut job_progress_reporter,
    job,
    &args.job_dependencies.fs.scoped_temp_dir_creator_for_work,
    &work_temp_dir,
    &deps.mysql_pool
  ).await?;

  info!("Audio file: {:?}", audio_bucket_path.filesystem_path);

  let image_bucket_path = download_image_file(
    &job_args.image_source,
    &args.job_dependencies.public_bucket_client,
    &mut job_progress_reporter,
    job,
    &args.job_dependencies.fs.scoped_temp_dir_creator_for_work,
    &work_temp_dir,
    &deps.mysql_pool
  ).await?;

  info!("Image file: {:?}", image_bucket_path.filesystem_path);

  // ==================== TRANSCODE MEDIA (IF NECESSARY) ==================== //

  // TODO

  // ==================== SETUP FOR INFERENCE ==================== //

  info!("Ready for SadTalker inference...");

  job_progress_reporter.log_status("running inference")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  /*

  //let config_path = PathBuf::from("/models/voice_conversion/so-vits-svc/example_config.json"); // TODO: This could be variable.
  let input_wav_path = image_media_upload_fs_path;

  let output_audio_fs_path = work_temp_dir.path().join("output.wav");
  //let output_metadata_fs_path = temp_dir.path().join("metadata.json");
  //let output_spectrogram_fs_path = temp_dir.path().join("spectrogram.json");

  info!("Running RVC (v2) VC inference...");

  info!("Expected output audio filename: {:?}", &output_audio_fs_path);

  // TODO: Limit output length for premium.

  let maybe_args = job.maybe_inference_args
      .as_ref()
      .map(|args| args.args.as_ref())
      .flatten();

  // ==================== RUN INFERENCE SCRIPT ==================== //

  let inference_start_time = Instant::now();

  let command_exit_status = args.job_dependencies
      .job_type_details
      .rvc_v2
      .inference_command
      .execute_inference(InferenceArgs {
        model_path: &rvc_v2_model_fs_path,
        maybe_model_index_path: maybe_rvc_v2_model_index_fs_path,
        hubert_path: &args.job_dependencies.pretrained_models.rvc_v2_hubert.filesystem_path,
        input_path: &input_wav_path,
        output_path: &output_audio_fs_path,
      });

  let inference_duration = Instant::now().duration_since(inference_start_time);

  info!("Inference took duration to complete: {:?}", &inference_duration);

  if !command_exit_status.is_success() {
    error!("Inference failed: {:?}", command_exit_status);
    safe_delete_temp_file(&input_wav_path);
    safe_delete_temp_file(&output_audio_fs_path);
    safe_delete_temp_directory(&work_temp_dir);
    return Err(ProcessSingleJobError::Other(anyhow!("CommandExitStatus: {:?}", command_exit_status)));
  }

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output files exist...");

  check_file_exists(&output_audio_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;
  //check_file_exists(&output_metadata_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;
  //check_file_exists(&output_spectrogram_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Interrogating result file properties...");

  let file_size_bytes = file_size(&output_audio_fs_path)
      .map_err(|err| ProcessSingleJobError::Other(err))?;

  let maybe_mimetype = get_mimetype_for_file(&output_audio_fs_path)
      .map_err(|err| ProcessSingleJobError::from_io_error(err))?
      .map(|mime| mime.to_string());

  let audio_info = decode_basic_audio_file_info(&output_audio_fs_path, maybe_mimetype.as_deref(), None)
      .map_err(|err| ProcessSingleJobError::Other(err))?;

  if audio_info.required_full_decode {
    warn!("Required a full decode of the output data to get duration! That's inefficient!");
  }

  // TODO: Make a new python image that generates spectrograms from any audio file.

  let file_metadata = FileMetadata {
    duration_millis: audio_info.duration_millis,
    mimetype: maybe_mimetype,
    file_size_bytes,
  };

  //safe_delete_temp_file(&output_metadata_fs_path);

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  job_progress_reporter.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let result_bucket_location = VoiceConversionResultOriginalFilePath::generate_new();

  let result_bucket_object_pathbuf = result_bucket_location.to_full_object_pathbuf();

  info!("Audio destination bucket path: {:?}", &result_bucket_object_pathbuf);

  info!("Uploading audio...");

  args.job_dependencies.public_bucket_client.upload_filename_with_content_type(
    &result_bucket_object_pathbuf,
    &output_audio_fs_path,
    "audio/wav")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_audio_fs_path);

//  // ==================== UPLOAD SPECTROGRAM TO BUCKETS ==================== //
//
//  let spectrogram_result_object_path = args.job_dependencies.bucket_path_unifier.tts_inference_spectrogram_output_path(
//    &job.uuid_idempotency_token); // TODO: Don't use this!
//
//  info!("Spectrogram destination bucket path: {:?}", &spectrogram_result_object_path);
//
//  info!("Uploading spectrogram...");
//
//  args.job_dependencies.public_bucket_client.upload_filename_with_content_type(
//    &spectrogram_result_object_path,
//    &output_spectrogram_fs_path,
//    "application/json")
//      .await
//      .map_err(|e| ProcessSingleJobError::Other(e))?;
//
//  safe_delete_temp_file(&output_spectrogram_fs_path);

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&work_temp_dir);

  // ==================== SAVE RECORDS ==================== //

  info!("Saving vc inference record...");

  let (inference_result_token, id) = insert_voice_conversion_result(InsertArgs {
    pool: &args.job_dependencies.mysql_pool,
    job: &job,
    public_bucket_hash: result_bucket_location.get_object_hash(),
    file_size_bytes: file_metadata.file_size_bytes,
    duration_millis: file_metadata.duration_millis.unwrap_or(0),
    is_on_prem: args.job_dependencies.container.is_on_prem,
    worker_hostname: &args.job_dependencies.container.hostname,
    worker_cluster: &args.job_dependencies.container.cluster_name,
    is_debug_worker: args.job_dependencies.worker_details.is_debug_worker
  })
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("VC Done.");

  // TODO: Update upstream to be strongly typed
  let maybe_user_token = job.maybe_creator_user_token.as_deref()
      .map(|token| UserToken::new_from_str(token));

  args.job_dependencies.firehose_publisher.vc_inference_finished(
    maybe_user_token.as_ref(),
    &job.inference_job_token,
    inference_result_token.as_str())
      .await
      .map_err(|e| {
        error!("error publishing event: {:?}", e);
        ProcessSingleJobError::Other(anyhow!("error publishing event"))
      })?;

  job_progress_reporter.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        job.id, id, &inference_result_token);

  Ok(JobSuccessResult {
    maybe_result_entity: Some(ResultEntity {
      entity_type: InferenceResultType::VoiceConversion,
      entity_token: inference_result_token.to_string(),
    }),
    inference_duration,
  })

   */


  // TODO - REMOVE -
  let inference_start_time = Instant::now();
  let inference_duration = Instant::now().duration_since(inference_start_time);
  Ok(JobSuccessResult {
    maybe_result_entity: Some(ResultEntity {
      entity_type: InferenceResultType::VoiceConversion,
      entity_token: "todo".to_string(),
    }),
    inference_duration,
  })
}

#[derive(Deserialize, Default)]
struct FileMetadata {
  pub duration_millis: Option<u64>,
  pub mimetype: Option<String>,
  pub file_size_bytes: u64,
}
