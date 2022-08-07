use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use crate::{JobState, read_metadata_file};
use database_queries::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use log::{info, warn};
use std::path::PathBuf;
use tempdir::TempDir;
use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::hashing::hash_file_sha2::hash_file_sha2;
use database_queries::column_types::vocoder_type::VocoderType;
use database_queries::queries::tts::tts_download_jobs::tts_download_job_queries::insert_tts_model;
use database_queries::queries::vocoder::insert_vocoder_model::{Args, insert_vocoder_model};

pub async fn process_hifigan_vocoder(
  job_state: &JobState,
  job: &AvailableDownloadJob,
  temp_dir: &TempDir
) -> AnyhowResult<()> {

  // ==================== RUN MODEL CHECK ==================== //

  info!("Checking that model is valid...");

  redis_logger.log_status("checking model")?;

  let file_path = PathBuf::from(download_filename.clone());

  let output_metadata_fs_path = temp_dir.path().join("metadata.json");

  // TODO TODO TODO CHECK MODEL VALIDITY
  // TODO TODO TODO CHECK MODEL VALIDITY
  // TODO TODO TODO CHECK MODEL VALIDITY
  // TODO TODO TODO CHECK MODEL VALIDITY
  // TODO TODO TODO CHECK MODEL VALIDITY

  //match model_type {
  //  TtsModelType::Tacotron2 => {
  //    let result = job_state.tacotron_tts_check.execute(
  //      &file_path,
  //      &output_metadata_fs_path,
  //      false,
  //    );

  //    if let Err(e) = result {
  //      safe_delete_temp_file(&file_path);
  //      safe_delete_temp_directory(&temp_dir);
  //    }
  //  },
  //  TtsModelType::Talknet => {
  //    let result = job_state.talknet_tts_check.execute(
  //      &file_path,
  //      &output_metadata_fs_path,
  //      false,
  //    );

  //    if let Err(e) = result {
  //      safe_delete_temp_file(&file_path);
  //      safe_delete_temp_directory(&temp_dir);
  //    }
  //  },
  //}

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that metadata output file exists...");

  check_file_exists(&output_metadata_fs_path)?;

  let file_metadata = match read_metadata_file(&output_metadata_fs_path) {
    Ok(metadata) => metadata,
    Err(e) => {
      safe_delete_temp_file(&file_path);
      safe_delete_temp_file(&output_metadata_fs_path);
      safe_delete_temp_directory(&temp_dir);
      return Err(e);
    }
  };

  // ==================== UPLOAD MODEL FILE ==================== //

  info!("Uploading HifiGan vocoder to GCS...");

  let private_bucket_hash = hash_file_sha2(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  let model_bucket_path = job_state.bucket_path_unifier.vocoder_path(&private_bucket_hash);

  info!("Destination bucket path: {:?}", &model_bucket_path);

  redis_logger.log_status("uploading model")?;

  if let Err(e) = job_state.bucket_client.upload_filename(&model_bucket_path, &file_path).await {
    safe_delete_temp_file(&output_metadata_fs_path);
    safe_delete_temp_file(&file_path);
    safe_delete_temp_directory(&temp_dir);
    return Err(e);
  }

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_file(&output_metadata_fs_path);
  safe_delete_temp_file(&file_path);
  safe_delete_temp_directory(&temp_dir);

  // ==================== SAVE RECORDS ==================== //

  info!("Saving model record...");
  let (id, model_token) = insert_vocoder_model(Args {
    vocoder_type: VocoderType::HifiGan, // TODO: This is the only type for now.
    title: &job.title,
    original_download_url: &job.download_url,
    original_filename: "",
    file_size_bytes: 0,
    creator_user_token: "",
    creator_ip_address: "",
    creator_set_visibility: EntityVisibility::Public,
    private_bucket_hash: "",
    private_bucket_object_name: (),
    mysql_pool: &job_state.mysql_pool
  }).await?;

  job_state.badge_granter.maybe_grant_tts_model_uploads_badge(&job.creator_user_token)
      .await
      .map_err(|e| {
        warn!("error maybe awarding badge: {:?}", e);
        anyhow!("error maybe awarding badge")
      })?;


  Ok(())
}
