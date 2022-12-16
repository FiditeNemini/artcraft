use anyhow::anyhow;
use config::is_bad_download_url::is_bad_download_url;
use container_common::anyhow_result::AnyhowResult;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use crate::JobState;
use crate::job_types::hifigan::process_hifigan_vocoder::process_hifigan_vocoder;
use crate::job_types::tacotron::process_tacotron_model::process_tacotron_model;
use database_queries::queries::generic_download::job::list_available_generic_download_jobs::AvailableDownloadJob;
use database_queries::queries::generic_download::job::mark_generic_download_job_done::mark_generic_download_job_done;
use database_queries::queries::generic_download::job::mark_generic_download_job_pending_and_grab_lock::mark_generic_download_job_pending_and_grab_lock;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{info, warn};
use reusable_types::db::enums::generic_download_type::GenericDownloadType;
use tempdir::TempDir;

pub async fn process_single_job(job_state: &JobState, job: &AvailableDownloadJob) -> AnyhowResult<()> {
  let mut redis = job_state.redis_pool.get()?;
  let mut redis_logger = RedisJobStatusLogger::new_generic_download(&mut redis, job.download_job_token.as_str());

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = mark_generic_download_job_pending_and_grab_lock(&job_state.mysql_pool, job.id).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id.0);
    return Ok(())
  }

  // ==================== SETUP TEMP DIRS ==================== //

  let temp_dir = format!("temp_{}", job.id.0);
  let temp_dir = TempDir::new(&temp_dir)?;

  // ==================== DOWNLOAD MODEL FILE ==================== //

  info!("Calling downloader...");

  redis_logger.log_status("downloading URL")?;

  if is_bad_download_url(&job.download_url)? {
    warn!("Bad download URL: `{}`", &job.download_url);
    return Err(anyhow!("Bad download URL: `{}`", &job.download_url));
  }

  let download_filename = match job_state.sidecar_configs.google_drive_downloader.download_file(&job.download_url, &temp_dir).await {
    Ok(filename) => filename,
    Err(e) => {
      safe_delete_temp_directory(&temp_dir);
      return Err(e);
    }
  };

  info!("Downloaded filename: {}", &download_filename);

  // ==================== HANDLE DIFFERENT DOWNLOAD TYPES ==================== //

  let mut entity_token : Option<String> = None;
  let mut entity_type : Option<String> = None;

  match job.download_type {
    GenericDownloadType::HifiGan => {
      let results = process_hifigan_vocoder(
        job_state,
        job,
        &temp_dir,
        &download_filename,
        &mut redis_logger,
      ).await?;
      entity_token = results.entity_token.clone();
      entity_type = results.entity_type.clone();
    }
    GenericDownloadType::Tacotron2 => {
      let results = process_tacotron_model(
        job_state,
        job,
        &temp_dir,
        &download_filename,
        &mut redis_logger,
      ).await?;
      entity_token = results.entity_token.clone();
      entity_type = results.entity_type.clone();
    }
    GenericDownloadType::HifiGanRocketVc => {}
    GenericDownloadType::RocketVc => {}
  }

  // =====================================================

  info!("Marking job complete...");
  mark_generic_download_job_done(
    &job_state.mysql_pool,
    job,
    true,
    entity_token.as_deref(),
    entity_type.as_deref(),
  ).await?;

  info!("Saved model record: {} - {}", job.id.0, &job.download_job_token);

  job_state.firehose_publisher.publish_generic_download_finished(
    &job.creator_user_token,
    entity_token.as_deref())
      .await
      .map_err(|e| {
        warn!("error publishing event: {:?}", e);
        anyhow!("error publishing event")
      })?;

  redis_logger.log_status("done")?;

  info!("Job done: {}", job.id.0);

  Ok(())
}
