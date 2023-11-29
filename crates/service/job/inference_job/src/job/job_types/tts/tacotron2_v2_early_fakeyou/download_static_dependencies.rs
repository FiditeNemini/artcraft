use std::path::PathBuf;

use jobs_common::job_progress_reporter::job_progress_reporter::JobProgressReporter;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron2_dependencies::Tacotron2Dependencies;
use crate::job_dependencies::JobDependencies;
use crate::util::maybe_download_file_from_bucket::maybe_download_file_from_bucket;

pub struct StaticDependencies {
  pub waveglow_vocoder_model_fs_path : PathBuf,
  pub pretrained_hifigan_vocoder_model_fs_path: PathBuf,
  pub hifigan_superres_vocoder_model_fs_path : PathBuf,
}


pub async fn download_static_dependencies<'a>(
  job_dependencies: &'a JobDependencies,
  job: &'a AvailableInferenceJob,
  model_dependencies: &'a Tacotron2Dependencies,
  mut job_progress_reporter: &mut Box<dyn JobProgressReporter>,
) -> Result<StaticDependencies, ProcessSingleJobError> {


  // ==================== CONFIRM OR DOWNLOAD WAVEGLOW VOCODER MODEL ==================== //

  let waveglow_vocoder_model_fs_path = {
    // TODO(bt,2023-11-21): Port this to the common downloader code.
    let waveglow_vocoder_model_filename = model_dependencies.waveglow_vocoder_model_filename.clone();
    let waveglow_vocoder_model_fs_path = job_dependencies.fs.semi_persistent_cache.tts_pretrained_vocoder_model_path(&waveglow_vocoder_model_filename);
    let waveglow_vocoder_model_object_path = job_dependencies.buckets.bucket_path_unifier.tts_pretrained_vocoders_path(&waveglow_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "waveglow vocoder model",
      &waveglow_vocoder_model_fs_path,
      &waveglow_vocoder_model_object_path,
      &job_dependencies.buckets.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (1 of 3)",
      job.id.0,
      &job_dependencies.fs.scoped_temp_dir_creator_for_short_lived_downloads,
    ).await?;

    waveglow_vocoder_model_fs_path
  };

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (NORMAL) VOCODER MODEL ==================== //

  let pretrained_hifigan_vocoder_model_fs_path = {
    // TODO(bt,2023-11-21): Port this to the common downloader code.
    let hifigan_vocoder_model_filename = model_dependencies.hifigan_vocoder_model_filename.clone();
    let hifigan_vocoder_model_fs_path = job_dependencies.fs.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_vocoder_model_filename);
    let hifigan_vocoder_model_object_path = job_dependencies.buckets.bucket_path_unifier.tts_pretrained_vocoders_path(&hifigan_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "hifigan vocoder model",
      &hifigan_vocoder_model_fs_path,
      &hifigan_vocoder_model_object_path,
      &job_dependencies.buckets.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (2 of 3)",
      job.id.0,
      &job_dependencies.fs.scoped_temp_dir_creator_for_short_lived_downloads,
    ).await?;

    hifigan_vocoder_model_fs_path
  };

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (SUPERRES) VOCODER MODEL ==================== //

  let hifigan_superres_vocoder_model_fs_path = {
    // TODO(bt,2023-11-21): Port this to the common downloader code.
    let hifigan_superres_vocoder_model_filename = model_dependencies.hifigan_superres_vocoder_model_filename.clone();
    let hifigan_superres_vocoder_model_fs_path = job_dependencies.fs.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_superres_vocoder_model_filename);
    let hifigan_superres_vocoder_model_object_path = job_dependencies.buckets.bucket_path_unifier.tts_pretrained_vocoders_path(&hifigan_superres_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "hifigan superres vocoder model",
      &hifigan_superres_vocoder_model_fs_path,
      &hifigan_superres_vocoder_model_object_path,
      &job_dependencies.buckets.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (3 of 3)",
      job.id.0,
      &job_dependencies.fs.scoped_temp_dir_creator_for_short_lived_downloads,
    ).await?;

    hifigan_superres_vocoder_model_fs_path
  };

  Ok(StaticDependencies {
    waveglow_vocoder_model_fs_path,
    pretrained_hifigan_vocoder_model_fs_path,
    hifigan_superres_vocoder_model_fs_path,
  })
}
