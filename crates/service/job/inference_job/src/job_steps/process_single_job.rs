use anyhow::anyhow;
use config::is_bad_download_url::is_bad_download_url;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use crate::job_steps::job_dependencies::JobDependencies;
use database_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use database_queries::queries::generic_inference::job::mark_generic_inference_job_pending_and_grab_lock::mark_generic_inference_job_pending_and_grab_lock;
use database_queries::queries::generic_inference::job::mark_generic_inference_job_successfully_done::mark_generic_inference_job_successfully_done;
use enums::workers::generic_inference_type::GenericInferenceType;
use errors::AnyhowResult;
use jobs_common::redis_job_status_logger::RedisJobStatusLogger;
use log::{info, warn};
use tempdir::TempDir;

pub async fn process_single_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob) -> AnyhowResult<()> {
  let mut redis = job_dependencies.redis_pool.get()?;
  let mut redis_logger = RedisJobStatusLogger::new_generic_download(&mut redis, job.download_job_token.as_str());

  // ==================== ATTEMPT TO GRAB JOB LOCK ==================== //

  let lock_acquired = mark_generic_inference_job_pending_and_grab_lock(&job_dependencies.mysql_pool, job.id).await?;

  if !lock_acquired {
    warn!("Could not acquire job lock for: {}", &job.id.0);
    return Ok(())
  }

  info!("Beginning work on {:?} = {} | {}", job.download_type, job.download_job_token, job.download_url);

  // ==================== SETUP TEMP DIRS ==================== //

  // TODO: Scoped temp dir

  let temp_dir = format!("temp_{}", job.id.0);
  let temp_dir = TempDir::new(&temp_dir)?;

  // ==================== HANDLE DIFFERENT INFERENCE TYPES ==================== //

  let mut entity_token : Option<String> = None;
  let mut entity_type : Option<String> = None;

  match job.inference_type {
    GenericInferenceType::TextToSpeech => {
      // TODO
    }
    GenericInferenceType::VoiceConversion => {
      // TODO
    }
//    GenericDownloadType::HifiGan => {
//      let results = process_hifigan_vocoder(
//        job_state,
//        job,
//        &temp_dir,
//        &download_filename,
//        &mut redis_logger,
//      ).await?;
//      entity_token = results.entity_token.clone();
//      entity_type = results.entity_type.clone();
//    }
//    GenericDownloadType::HifiGanRocketVc => {
//      let results = process_hifigan_softvc_vocoder(
//        job_state,
//        job,
//        &temp_dir,
//        &download_filename,
//        &mut redis_logger,
//      ).await?;
//      entity_token = results.entity_token.clone();
//      entity_type = results.entity_type.clone();
//    }
//    GenericDownloadType::RocketVc => {
//      let results = process_softvc_model(
//        job_state,
//        job,
//        &temp_dir,
//        &download_filename,
//        &mut redis_logger,
//      ).await?;
//      entity_token = results.entity_token.clone();
//      entity_type = results.entity_type.clone();
//    }
//    GenericDownloadType::Tacotron2 => {
//      let results = process_tacotron_model(
//        job_state,
//        job,
//        &temp_dir,
//        &download_filename,
//        &mut redis_logger,
//      ).await?;
//      entity_token = results.entity_token.clone();
//      entity_type = results.entity_type.clone();
//    }
  }

  // =====================================================

  info!("Marking job complete...");
  mark_generic_inference_job_successfully_done(
    &job_dependencies.mysql_pool,
    job,
    entity_type.as_deref(),
    entity_token.as_deref(),
  ).await?;

  info!("Saved model record: {} - {}", job.id.0, &job.inference_job_token);

  job_dependencies.firehose_publisher.publish_generic_download_finished(
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
