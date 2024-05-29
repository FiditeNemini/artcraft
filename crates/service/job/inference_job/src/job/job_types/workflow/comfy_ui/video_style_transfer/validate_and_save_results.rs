use std::path::Path;
use std::thread;
use std::time::Duration;

use anyhow::anyhow;
use log::{debug, error, info};
use tempdir::TempDir;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use enums::by_table::prompts::prompt_type::PromptType;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use errors::AnyhowResult;
use filesys::file_size::file_size;
use filesys::path_to_string::path_to_string;
use filesys::safe_delete_temp_directory::safe_delete_temp_directory;
use filesys::safe_delete_temp_file::safe_delete_temp_file;
use filesys::safe_recursively_delete_files::safe_recursively_delete_files;
use hashing::sha256::sha256_hash_file::sha256_hash_file;
use jobs_common::job_progress_reporter::job_progress_reporter::JobProgressReporter;
use mimetypes::mimetype_for_file::get_mimetype_for_file;
use mysql_queries::payloads::generic_inference_args::workflow_payload::WorkflowArgs;
use mysql_queries::payloads::prompt_args::prompt_inner_payload::PromptInnerPayloadBuilder;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::create::insert_media_file_from_comfy_ui::{insert_media_file_from_comfy_ui, InsertArgs};
use mysql_queries::queries::prompts::insert_prompt::{insert_prompt, InsertPromptArgs};
use thumbnail_generator::task_client::thumbnail_task::ThumbnailTaskBuilder;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::prompts::PromptToken;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::workflow::comfy_ui::comfy_process_job_args::ComfyProcessJobArgs;
use crate::job::job_types::workflow::comfy_ui::video_style_transfer::download_input_video::VideoDownloadDetails;
use crate::job::job_types::workflow::comfy_ui::video_style_transfer::job_outputs::JobOutputs;
use crate::job::job_types::workflow::comfy_ui::video_style_transfer::validate_job::JobArgs;
use crate::job_dependencies::JobDependencies;

fn get_file_extension(mimetype: &str) -> anyhow::Result<&'static str> {
  let ext = match mimetype {
    "video/mp4" => "mp4",
    "image/png" => "png",
    "image/jpeg" => "jpg",
    "image/gif" => "gif",
    _ => return Err(anyhow!("Mimetype not supported: {}", mimetype)),
  };

  Ok(ext)
}

pub struct SaveResultsArgs<'a> {
  pub job: &'a AvailableInferenceJob,
  pub deps: &'a JobDependencies,
  pub job_args: &'a JobArgs<'a>,
  pub comfy_args: &'a WorkflowArgs,
  pub videos: &'a JobOutputs,
  pub job_progress_reporter: &'a mut Box<dyn JobProgressReporter>,
  pub work_temp_dir: &'a TempDir,
  pub workflow_path: &'a str,
  pub root_comfy_path: &'a Path,
  pub maybe_lora_path: Option<&'a Path>,
  pub download_video: VideoDownloadDetails,
  pub should_insert_prompt_record: bool,
  pub maybe_style_name: Option<StyleTransferName>,
  pub inference_duration: Duration,
  pub maybe_positive_prompt: Option<&'a str>,
  pub maybe_negative_prompt: Option<&'a str>,
}

pub async fn validate_and_save_results(args: SaveResultsArgs<'_>) -> Result<MediaFileToken, ProcessSingleJobError> {

  // ==================== GET METADATA ==================== //

  info!("Interrogating result file size ...");

  let final_video = args.videos.get_final_video_to_upload();

  let file_size_bytes = file_size(final_video)
      .map_err(|err| ProcessSingleJobError::Other(err))?;

  info!("Interrogating result mimetype ...");

  let mimetype = get_mimetype_for_file(final_video)
      .map_err(|err| ProcessSingleJobError::from_io_error(err))?
      .map(|mime| mime.to_string())
      .ok_or(ProcessSingleJobError::Other(anyhow!("Mimetype could not be determined")))?;

  // create ext from mimetype
  let ext = get_file_extension(mimetype.as_str())
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // Extension is really a "suffix" and should have the leading period to act as an extension.
  let ext = if ext.starts_with(".") {
    ext.to_string()
  } else {
    format!(".{ext}")
  };

  const PREFIX: &str = "storyteller_";

  //// determine media type from mime type
  //let media_type = match mimetype.as_str() {
  //    "video/mp4" => MediaFileType::Video,
  //    "image/png" => MediaFileType::Image,
  //    "image/jpeg" => MediaFileType::Image,
  //    _ => return Err(ProcessSingleJobError::Other(anyhow!("Mimetype not supported: {}", mimetype))),
  //};

  info!("Calculating sha256...");

  let file_checksum = sha256_hash_file(final_video)
      .map_err(|err| {
        ProcessSingleJobError::Other(anyhow!("Error hashing file: {:?}", err))
      })?;

  // ==================== UPLOAD VIDEO TO BUCKET ==================== //

  args.job_progress_reporter.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let result_bucket_location = MediaFileBucketPath::generate_new(
    Some(PREFIX),
    Some(&ext));

  let result_bucket_object_pathbuf = result_bucket_location.to_full_object_pathbuf();

  info!("Output file destination bucket path: {:?}", &result_bucket_object_pathbuf);

  info!("Uploading media ...");

  args.deps.buckets.public_bucket_client.upload_filename_with_content_type(
    &result_bucket_object_pathbuf,
    &final_video,
    &mimetype) // TODO: We should check the mimetype to make sure bad payloads can't get uploaded
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  // generate thumbnail using thumbnail service
  let thumbnail_types = match mimetype.as_str() {
    "video/mp4" => vec!["image/gif", "image/jpeg"],
    _ => vec![],
  };

  info!("Generating thumbnail tasks...");

  for output_type in thumbnail_types {
    let thumbnail_task_result = ThumbnailTaskBuilder::new()
        .with_bucket(&*args.deps.buckets.public_bucket_client.bucket_name())
        .with_path(&*path_to_string(result_bucket_object_pathbuf.clone()))
        .with_source_mimetype(mimetype.as_str())
        .with_output_mimetype(output_type)
        .with_output_suffix("thumb")
        .with_output_extension(&ext)
        .with_event_id(&args.job.id.0.to_string())
        .send()
        .await;

    match thumbnail_task_result {
      Ok(thumbnail_task) => {
        debug!("Thumbnail task created: {:?}", thumbnail_task);
      },
      Err(e) => {
        error!("Failed to create thumbnail task: {:?}", e);
      }
    }
  }

  // Also upload the non-watermarked copy
  info!("Uploading non-watermarked copy...");

  let result = args.deps.buckets.public_bucket_client.upload_filename_with_content_type(
    &result_bucket_object_pathbuf.with_extension("no_watermark.mp4"),
    &args.videos.get_non_watermarked_video_to_upload(),
    &mimetype) // TODO: We should check the mimetype to make sure bad payloads can't get uploaded
      .await;

  if let Err(err) = result {
    error!("Failed to upload non-watermarked copy: {:?}", err);
  }

  if let Some(sleep_millis) = args.comfy_args.sleep_millis {
    info!("Sleeping for millis: {sleep_millis}");
    thread::sleep(Duration::from_millis(sleep_millis));
  }

  // ==================== CLEANUP/ DELETE TEMP FILES ==================== //

  info!("Cleaning up temporary files...");

  safe_delete_temp_file(&args.videos.original_video_path);
  safe_delete_temp_file(&args.videos.trimmed_resampled_video_path);
  safe_delete_temp_file(&args.videos.comfy_output_video_path);
  safe_delete_temp_file(args.videos.video_to_watermark());
  safe_delete_temp_file(args.videos.get_final_video_to_upload());
  safe_delete_temp_file(args.videos.get_non_watermarked_video_to_upload());

  // TODO(bt,2024-03-01): Do we really want to delete the workflow, models, etc.?

  safe_delete_temp_file(&args.workflow_path);

  // TODO(bt,2024-04-21): Not sure we want to delete the LoRA?
  if let Some(lora_path) = args.maybe_lora_path {
    safe_delete_temp_file(lora_path);
  }

  let output_dir = args.root_comfy_path.join("output");
  safe_recursively_delete_files(&output_dir);

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&args.work_temp_dir);

  // ==================== SAVE RECORDS ==================== //

  // create a json detailing the args used to create the media
  let args_json = serde_json::to_string(&args.job_args)
      .map_err(|e| ProcessSingleJobError::Other(e.into()))?;

  info!("Saving ComfyUI result (media_files table record) ...");

  // NB: We do this to avoid deep-frying the video.
  // This also lets us hide the engine renders from users.
  // This shouldn't ever become a deeply nested tree of children, but rather a single root
  // with potentially many direct children.
  let style_transfer_source_media_file_token = args.download_video
      .input_video_media_file
      .maybe_style_transfer_source_media_file_token
      .as_ref()
      .unwrap_or_else(|| &args.download_video.input_video_media_file.token);

  let prompt_token = PromptToken::generate();

  let (media_file_token, id) = insert_media_file_from_comfy_ui(InsertArgs {
    pool: &args.deps.db.mysql_pool,
    job: &args.job,
    maybe_mime_type: Some(&mimetype),
    maybe_title: args.download_video.input_video_media_file.maybe_title.as_deref(),
    maybe_style_transfer_source_media_file_token: Some(&style_transfer_source_media_file_token),
    maybe_scene_source_media_file_token: args.download_video.input_video_media_file.maybe_scene_source_media_file_token.as_ref(),
    file_size_bytes,
    sha256_checksum: &file_checksum,
    maybe_prompt_token: Some(&prompt_token),
    public_bucket_directory_hash: result_bucket_location.get_object_hash(),
    maybe_public_bucket_prefix: Some(PREFIX),
    maybe_public_bucket_extension: Some(&ext),
    is_on_prem: args.deps.job.info.container.is_on_prem,
    worker_hostname: &args.deps.job.info.container.hostname,
    worker_cluster: &args.deps.job.info.container.cluster_name,
    extra_file_modification_info: Some(&args_json),
  })
      .await
      .map_err(|e| {
        error!("Error saving media file record: {:?}", e);
        ProcessSingleJobError::Other(e)
      })?;

  if args.should_insert_prompt_record {
    info!("Saving prompt record");

    let mut other_args_builder = PromptInnerPayloadBuilder::new();

    if let Some(style_name) = args.maybe_style_name {
      info!("building PromptInnerPayload with style_name = {:?}", style_name);
      other_args_builder.set_style_name(style_name);
    }

    if args.comfy_args.use_face_detailer.unwrap_or(false) {
      other_args_builder.set_used_face_detailer(true);
    }

    if args.comfy_args.use_upscaler.unwrap_or(false) {
      other_args_builder.set_used_upscaler(true);
    }

    other_args_builder.set_strength(args.comfy_args.strength);

    if let Ok(duration) = chrono::Duration::from_std(args.inference_duration) {
      // NB: Fail open.
      other_args_builder.set_inference_duration(Some(duration));
    }

    let maybe_other_args = other_args_builder.build();

    info!("maybe other prompt args: {:?}", maybe_other_args);

    // NB: Don't fail the job if the query fails.
    let prompt_result = insert_prompt(InsertPromptArgs {
      maybe_apriori_prompt_token: Some(&prompt_token),
      prompt_type: PromptType::ComfyUi,
      maybe_creator_user_token: args.job.maybe_creator_user_token_typed.as_ref(),
      maybe_positive_prompt: args.maybe_positive_prompt.as_deref(),
      maybe_negative_prompt: args.maybe_negative_prompt.as_deref(),
      maybe_other_args: maybe_other_args.as_ref(),
      creator_ip_address: &args.job.creator_ip_address,
      mysql_executor: &args.deps.db.mysql_pool,
      phantom: Default::default(),
    }).await;

    if let Err(err) = prompt_result {
      error!("No prompt result token? something has failed: {:?} (we'll ignore this error)", err);
    }
  }

  info!("ComfyUI Done.");

  args.job_progress_reporter.log_status("done")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Result video media token: {:?}", &media_file_token);

  info!("Job {:?} complete success! Downloaded, ran inference, and uploaded. Saved model record: {}, Result Token: {}",
        args.job.id, id, &media_file_token);

  Ok(media_file_token)
}
