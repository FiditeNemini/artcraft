use std::fs::read_to_string;
use std::path::PathBuf;
use std::time::{Duration, Instant};

use actix_web::dev::ResourcePath;
use anyhow::anyhow;
use log::{error, info, warn};
use serde_json;

use cloud_storage::remote_file_manager::media_descriptor::MediaImagePngDescriptor;
use cloud_storage::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;
use cloud_storage::remote_file_manager::remote_cloud_file_manager::RemoteCloudFileClient;
use cloud_storage::remote_file_manager::weights_descriptor::{WeightsLoRADescriptor, WeightsSD15Descriptor};
use composite_identifiers::by_table::batch_generations::batch_generation_entity::BatchGenerationEntity;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use enums::by_table::generic_synthetic_ids::id_category::IdCategory;
use enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory;
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use filesys::file_exists::file_exists;
use filesys::path_to_string::path_to_string;
use google_drive_common::google_drive_download_command::GoogleDriveDownloadCommand;
use mysql_queries::payloads::generic_inference_args::generic_inference_args::{GenericInferenceArgs, PolymorphicInferenceArgs};
use mysql_queries::payloads::generic_inference_args::image_generation_payload::StableDiffusionArgs;
use mysql_queries::queries::batch_generations::insert_batch_generation_records::{insert_batch_generation_records, InsertBatchArgs};
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::media_files::create::insert_media_file_generic::{insert_media_file_generic, InsertArgs};
use mysql_queries::queries::model_weights::create::create_weight::{
  create_weight,
  CreateModelWeightsArgs,
};
use mysql_queries::queries::model_weights::get::get_weight::get_weight_by_token;
use tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken;
use tokens::tokens::batch_generations::BatchGenerationToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::users::UserToken;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::image_generation::sd::process_job::{InferenceValues, sd_args_from_job, StableDiffusionProcessArgs};
use crate::job::job_types::image_generation::sd::process_job_lora_upload::process_job_lora_upload;
use crate::job::job_types::image_generation::sd::process_job_sd_upload::process_job_sd_upload;
use crate::job::job_types::image_generation::sd::sd_inference_command::InferenceArgs;
use crate::job_dependencies::JobDependencies;

pub async fn process_job_inference(
  args: &StableDiffusionProcessArgs<'_>
) -> Result<JobSuccessResult, ProcessSingleJobError> {
  let job = args.job;
  let deps = args.job_dependencies;
  let mysql_pool = &deps.db.mysql_pool;

  let sd_args = sd_args_from_job(&args).await?;
  let sd_deps: &crate::job::job_types::image_generation::sd::stable_diffusion_dependencies::StableDiffusionDependencies = match
  &args.job_dependencies.job.job_specific_dependencies.maybe_stable_diffusion_dependencies
  {
    None => {
      return Err(ProcessSingleJobError::Other(anyhow!("Missing Job Specific Dependencies")));
    }
    Some(val) => { val }
  };

  let _creator_user_token: UserToken;
  let _anon_user_token: Option<AnonymousVisitorTrackingToken>;

  match &job.maybe_creator_anonymous_visitor_token {
    Some(token) => {
      let anonymous_visitor_token = AnonymousVisitorTrackingToken::new_from_str(token);
      _anon_user_token = Some(anonymous_visitor_token);
    }
    None => {
      _anon_user_token = None;
    }
  }

  match &job.maybe_creator_user_token {
    Some(token) => {
      _creator_user_token = UserToken::new_from_str(token);
    }
    None => {
      return Err(ProcessSingleJobError::InvalidJob(anyhow!("Missing Creator User Token")));
    }
  }

  let _job_progress_reporter = args.job_dependencies.clients.job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  //==================== TEMP DIR ==================== //

  let work_temp_dir = format!("temp_stable_diffusion_inference_{}", job.id.0);

  //NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let work_temp_dir = args.job_dependencies.fs.scoped_temp_dir_creator_for_work
      .new_tempdir(&work_temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  //let sd_checkpoint_path = work_temp_dir.path().join("sd_checkpoint.safetensors");
  let mut lora_path = work_temp_dir.path().join("lora.safetensors");
  //let vae_path = work_temp_dir.path().join("vae.safetensors");
  let vae_path = work_temp_dir.path().join("vae.pt"); // TODO: Should this be `.safetensors` or `.pt`?
  let output_path = work_temp_dir.path().join("output");

  info!("Paths to download to:");
  info!("lora_path: {:?}", lora_path);
  info!("vae_path: {:?}", vae_path);
  info!("output_path: {:?}", output_path);

  // thread::sleep(seconds) to check the directory

  // // Unpack loRA and Checkpoint
  // // run inference by downloading from google drive.
  let lora_token = sd_args.maybe_lora_model_token;
///  let weight_token = sd_args.maybe_sd_model_token.clone();

  let sd_model_weight_token = match sd_args.maybe_sd_model_token {
    None => return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no sd model token for job!"))),
    Some(ref token) => token,
  };

  let sd_model_weight = get_weight_by_token(
    sd_model_weight_token,
    false,
    &deps.db.mysql_pool
  ).await?;

  let sd_model_weight = match sd_model_weight {
    None => return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("no record of sd model!"))),
    Some(record) => record,
  };

  let sd_checkpoint_path = args.job_dependencies
      .fs
      .model_weights_cache_directory
      .get_model_weight_from_cache_or_bucket(&sd_model_weight)
      .await?;

  info!("sd_checkpoint_path: {:?}", sd_checkpoint_path);

  // origin file name needs to be just the file name  /tmp/downloads_long_lived/temp_stable_diffusion_inference_32.8qJJljxWWZeD/output_0.png
  // ignore if no lora token

  let mut maybe_lora_record = None;

  if let Some(token) = lora_token {
    maybe_lora_record = get_weight_by_token(
      &token,
      false,
      &deps.db.mysql_pool
    ).await?;
  }

  let remote_cloud_file_client = RemoteCloudFileClient::get_remote_cloud_file_client().await?;

  let mut lora_name = String::from("");
  let mut lora_token = String::from("");

  match maybe_lora_record {
    None => {
      lora_path.clear();
    }
    Some(lora_record) => {
      lora_name = lora_record.title.to_string();
      lora_token = lora_record.token.to_string();

      lora_path = args.job_dependencies
          .fs
          .model_weights_cache_directory
          .get_model_weight_from_cache_or_bucket(&lora_record)
          .await?;
    }
  }

  args.job_dependencies
      .buckets
      .public_bucket_client
      .download_file_to_disk(&sd_deps.vae_bucket_path, &vae_path)
      .await
      .map_err(|err| {
        error!("could not download VAE: {:?}", err);
        ProcessSingleJobError::from_anyhow_error(anyhow!("could not download VAE: {:?}", err))
      })?;

  let prompt = match sd_args.maybe_prompt {
    Some(val) => val,
    None => {
      return Err(ProcessSingleJobError::from_anyhow_error(anyhow!("No Prompt provided!")));
    }
  };

  let stderr_output_file = work_temp_dir.path().join("sd_err.txt");
  let stdout_output_file = work_temp_dir.path().join("sd_out.txt");

  let number_of_samples = match sd_args.maybe_number_of_samples {
    Some(val) => val,
    None => 20,
  };

  let inference_start_time = Instant::now();

  let exit_status = sd_deps.inference_command.execute_inference(InferenceArgs {
    work_dir: work_temp_dir.path().to_path_buf(),
    output_file: output_path.clone(),
    stderr_output_file: &stderr_output_file,
    stdout_output_file: &stdout_output_file,
    prompt: prompt.clone(),
    negative_prompt: sd_args.maybe_n_prompt.clone().unwrap_or_default(),
    number_of_samples,
    samplers: sd_args.maybe_sampler.clone().unwrap_or(String::from("Euler a")),
    width: sd_args.maybe_width.unwrap_or(512),
    height: sd_args.maybe_height.unwrap_or(512),
    cfg_scale: sd_args.maybe_cfg_scale.unwrap_or(7),
    seed: sd_args.maybe_seed.unwrap_or(1),
    lora_path: lora_path.clone(),
    checkpoint_path: sd_checkpoint_path.clone(),
    vae: vae_path.clone(),
    batch_count: sd_args.maybe_batch_count.unwrap_or(1),
  });

  if !exit_status.is_success() {
    error!("SD inference failed: {:?}", exit_status);

    let error = ProcessSingleJobError::Other(anyhow!("CommandExitStatus: {:?}", exit_status));

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
    return Err(error);
  }


  // hack to check the directory before clean up.
  //   let thirtyMinutes = 1800;
  //   thread::sleep(Duration::from_secs(thirtyMinutes));
  // upload media and create a record.

  let inference_duration = Instant::now().duration_since(inference_start_time);

  // run a for loop for output images output_0 in the folder then use upload media.
  // pngs

  let mut entries = vec![];

  let inputs = InferenceValues {
    prompt: prompt.clone(),
    cfg_scale: sd_args.maybe_cfg_scale.unwrap_or(7),
    negative_prompt: sd_args.maybe_n_prompt,
    lora_model_weight_token: Some(lora_token),
    lora_name: Some(lora_name),
    sampler: sd_args.maybe_sampler.unwrap_or(String::from("Euler a")),
    width: sd_args.maybe_width.unwrap_or(512),
    height: sd_args.maybe_height.unwrap_or(512),
    seed: sd_args.maybe_seed.unwrap_or(1),
    number_of_samples,
  };

  let inputs = match serde_json::to_string(&inputs) {
    Ok(result) => result,
    Err(_err) => {
      return Err(
        ProcessSingleJobError::from_anyhow_error(anyhow!("couldn't serialize metadata."))
      );
    }
  };

  let batch_token = BatchGenerationToken::generate();

  let mut maybe_first_media_file_token = None;

  for i in 0..sd_args.maybe_batch_count.unwrap_or(1) {
    let path = output_path.clone();

    let file_path = format!("{}_{}.png", path_to_string(path), i);

    println!("Upload File Path:{}", file_path);

    let metadata = remote_cloud_file_client.upload_file(
      Box::new(MediaImagePngDescriptor {}),
      file_path.as_ref()
    ).await?;

    let bucket_details = match metadata.bucket_details {
      Some(val) => { val }
      None => {
        return Err(
          ProcessSingleJobError::from_anyhow_error(anyhow!("no VAE? thats a problem."))
        );
      }
    };

    // extra_file_modification_info: todo!(), // JSON ENCODED STRUCT
    let (media_file_token, _id) = insert_media_file_generic(InsertArgs {
      pool: mysql_pool,
      job,
      media_type: MediaFileType::Image,
      origin_category: MediaFileOriginCategory::Upload,
      origin_product_category: MediaFileOriginProductCategory::ImageGeneration,
      maybe_origin_model_type: Some(MediaFileOriginModelType::StableDiffusion15),
      maybe_origin_model_token: Some(sd_model_weight_token.clone()),
      maybe_origin_filename: Some(file_path),
      maybe_batch_token: Some(&batch_token),
      maybe_mime_type: Some(metadata.mimetype.as_ref()),
      file_size_bytes: metadata.file_size_bytes,
      maybe_duration_millis: Some(inference_duration.as_millis() as u64),
      maybe_audio_encoding: None,
      maybe_video_encoding: None,
      maybe_frame_width: Some(sd_args.maybe_width.unwrap_or(512)),
      maybe_frame_height: Some(sd_args.maybe_height.unwrap_or(512)),
      checksum_sha2: metadata.sha256_checksum.as_str(),
      public_bucket_directory_hash: bucket_details.object_hash.as_str(),
      maybe_public_bucket_prefix: Some(bucket_details.prefix.as_str()),
      maybe_public_bucket_extension: Some(bucket_details.suffix.as_str()),
      extra_file_modification_info: Some(&inputs),
      maybe_creator_file_synthetic_id_category: IdCategory::MediaFile,
      maybe_creator_category_synthetic_id_category: IdCategory::ModelWeights,
      maybe_mod_user_token: None,
      is_generated_on_prem: args.job_dependencies.job.info.container.is_on_prem,
      generated_by_worker: Some(&args.job_dependencies.job.info.container.hostname),
      generated_by_cluster: Some(&args.job_dependencies.job.info.container.cluster_name),
    }).await?;

    if maybe_first_media_file_token.is_none() {
      maybe_first_media_file_token = Some(media_file_token.clone());
    }

    let batch_generation_entity: BatchGenerationEntity = BatchGenerationEntity::MediaFile(
      media_file_token
    );

    entries.push(batch_generation_entity);
  }

  let mut transaction = mysql_pool.begin().await.unwrap();

  let batch_token_result = insert_batch_generation_records(InsertBatchArgs {
    entries,
    maybe_existing_batch_token: Some(&batch_token),
    transaction: &mut transaction,
  }).await;

  let _batch_token = match batch_token_result {
    Ok(v) => { v.to_string() }
    Err(_err) => {
      return Err(
        ProcessSingleJobError::from_anyhow_error(
          anyhow!("No batch token? something has failed.")
        )
      );
    }
  };

  // TODO(bt,2024-02-12): Return the batch token instead. (We're not ready for that.)
  Ok(JobSuccessResult {
    inference_duration,
    maybe_result_entity: maybe_first_media_file_token
        .map(|media_file_token| {
          ResultEntity {
            entity_type: InferenceResultType::MediaFile,
            entity_token: media_file_token.to_string(),
          }
        }),
  })
}
