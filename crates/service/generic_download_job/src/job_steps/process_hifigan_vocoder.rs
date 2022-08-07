use std::path::PathBuf;
use log::info;
use tempdir::TempDir;
use container_common::anyhow_result::AnyhowResult;
use database_queries::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use crate::JobState;

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

  match model_type {
    TtsModelType::Tacotron2 => {
      let result = job_state.tacotron_tts_check.execute(
        &file_path,
        &output_metadata_fs_path,
        false,
      );

      if let Err(e) = result {
        safe_delete_temp_file(&file_path);
        safe_delete_temp_directory(&temp_dir);
      }
    },
    TtsModelType::Talknet => {
      let result = job_state.talknet_tts_check.execute(
        &file_path,
        &output_metadata_fs_path,
        false,
      );

      if let Err(e) = result {
        safe_delete_temp_file(&file_path);
        safe_delete_temp_directory(&temp_dir);
      }
    },
  }

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

  info!("Uploading model to GCS...");

  let private_bucket_hash = hash_file_sha2(&download_filename)?;

  info!("File hash: {}", private_bucket_hash);

  let synthesizer_model_bucket_path = match model_type {
    TtsModelType::Tacotron2 => job_state.bucket_path_unifier.tts_synthesizer_path(&private_bucket_hash),
    TtsModelType::Talknet => job_state.bucket_path_unifier.tts_zipped_synthesizer_path(&private_bucket_hash),
  };

  info!("Destination bucket path: {:?}", &synthesizer_model_bucket_path);

  redis_logger.log_status("uploading model")?;

  if let Err(e) = job_state.bucket_client.upload_filename(&synthesizer_model_bucket_path, &file_path).await {
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
  let (id, model_token) = insert_tts_model(
    &job_state.mysql_pool,
    job,
    &private_bucket_hash,
    synthesizer_model_bucket_path,
    file_metadata.file_size_bytes)
      .await?;

  job_state.badge_granter.maybe_grant_tts_model_uploads_badge(&job.creator_user_token)
      .await
      .map_err(|e| {
        warn!("error maybe awarding badge: {:?}", e);
        anyhow!("error maybe awarding badge")
      })?;


  Ok(())
}
