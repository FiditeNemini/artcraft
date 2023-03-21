use anyhow::anyhow;
use crate::job::job_steps::process_single_job_error::ProcessSingleJobError;
use crate::job_dependencies::JobDependencies;
use crate::util::maybe_download_file_from_bucket::maybe_download_file_from_bucket;
use errors::AnyhowResult;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::TtsModelForInferenceRecord;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use log::info;
use tempdir::TempDir;
use tts_common::clean_symbols::clean_symbols;

/// Text starting with this will be treated as a test request.
/// This allows the request to bypass the model cache and query the latest TTS model.
const TEST_REQUEST_TEXT: &'static str = "This is a test request.";


pub struct ProcessJobArgs<'a> {
  pub job_dependencies: &'a JobDependencies,
  pub job: &'a AvailableInferenceJob,
  pub tts_model: &'a TtsModelForInferenceRecord,
  pub raw_inference_text: &'a str,
}

pub async fn process_job(args: ProcessJobArgs<'_>) -> Result<(), ProcessSingleJobError> {
  let job = args.job;
  let tts_model = args.tts_model;
  let raw_inference_text = args.raw_inference_text;

  let mut job_progress_reporter = args.job_dependencies
      .job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  // ==================== CONFIRM OR DOWNLOAD WAVEGLOW VOCODER MODEL ==================== //

  let waveglow_vocoder_model_fs_path = {
    let waveglow_vocoder_model_filename = args.job_dependencies.waveglow_vocoder_model_filename.clone();
    let waveglow_vocoder_model_fs_path = args.job_dependencies.semi_persistent_cache.tts_pretrained_vocoder_model_path(&waveglow_vocoder_model_filename);
    let waveglow_vocoder_model_object_path = args.job_dependencies.bucket_path_unifier.tts_pretrained_vocoders_path(&waveglow_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "waveglow vocoder model",
      &waveglow_vocoder_model_fs_path,
      &waveglow_vocoder_model_object_path,
      &args.job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (1 of 3)",
      job.id.0,
      &args.job_dependencies.scoped_temp_dir_creator,
    ).await?;

    waveglow_vocoder_model_fs_path
  };

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (NORMAL) VOCODER MODEL ==================== //

  let pretrained_hifigan_vocoder_model_fs_path = {
    let hifigan_vocoder_model_filename = args.job_dependencies.hifigan_vocoder_model_filename.clone();
    let hifigan_vocoder_model_fs_path = args.job_dependencies.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_vocoder_model_filename);
    let hifigan_vocoder_model_object_path = args.job_dependencies.bucket_path_unifier.tts_pretrained_vocoders_path(&hifigan_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "hifigan vocoder model",
      &hifigan_vocoder_model_fs_path,
      &hifigan_vocoder_model_object_path,
      &args.job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (2 of 3)",
      job.id.0,
      &args.job_dependencies.scoped_temp_dir_creator,
    ).await?;

    hifigan_vocoder_model_fs_path
  };

  // ==================== CONFIRM OR DOWNLOAD HIFIGAN (SUPERRES) VOCODER MODEL ==================== //

  let hifigan_superres_vocoder_model_fs_path = {
    let hifigan_superres_vocoder_model_filename = args.job_dependencies.hifigan_superres_vocoder_model_filename.clone();
    let hifigan_superres_vocoder_model_fs_path = args.job_dependencies.semi_persistent_cache.tts_pretrained_vocoder_model_path(&hifigan_superres_vocoder_model_filename);
    let hifigan_superres_vocoder_model_object_path = args.job_dependencies.bucket_path_unifier.tts_pretrained_vocoders_path(&hifigan_superres_vocoder_model_filename);

    maybe_download_file_from_bucket(
      "hifigan superres vocoder model",
      &hifigan_superres_vocoder_model_fs_path,
      &hifigan_superres_vocoder_model_object_path,
      &args.job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading vocoder (3 of 3)",
      job.id.0,
      &args.job_dependencies.scoped_temp_dir_creator,
    ).await?;

    hifigan_superres_vocoder_model_fs_path
  };

//  // ==================== CONFIRM OR DOWNLOAD OPTIONAL CUSTOM VOCODER MODEL ==================== //

  let custom_vocoder_fs_path = match &tts_model.maybe_custom_vocoder {
    None => None,
    Some(vocoder) => {
      let custom_vocoder_fs_path = args.job_dependencies.semi_persistent_cache.custom_vocoder_model_path(&vocoder.vocoder_token);
      let custom_vocoder_object_path  = args.job_dependencies.bucket_path_unifier.vocoder_path(&vocoder.vocoder_private_bucket_hash);

      maybe_download_file_from_bucket(
        "custom vocoder",
        &custom_vocoder_fs_path,
        &custom_vocoder_object_path,
        &args.job_dependencies.private_bucket_client,
        &mut job_progress_reporter,
        "downloading user vocoder",
        job.id.0,
        &args.job_dependencies.scoped_temp_dir_creator,
      ).await?;

      Some(custom_vocoder_fs_path)
    }
  };

  // ==================== CONFIRM OR DOWNLOAD TTS SYNTHESIZER MODEL ==================== //

  let tts_synthesizer_fs_path = {
    let tts_synthesizer_fs_path = args.job_dependencies.semi_persistent_cache.tts_synthesizer_model_path(tts_model.model_token.as_str());
    let tts_synthesizer_object_path  = args.job_dependencies.bucket_path_unifier.tts_synthesizer_path(&tts_model.private_bucket_hash);

    maybe_download_file_from_bucket(
      "synthesizer",
      &tts_synthesizer_fs_path,
      &tts_synthesizer_object_path,
      &args.job_dependencies.private_bucket_client,
      &mut job_progress_reporter,
      "downloading synthesizer",
      job.id.0,
      &args.job_dependencies.scoped_temp_dir_creator,
    ).await?;

    tts_synthesizer_fs_path
  };

  // ==================== Preprocess text ==================== //

  let cleaned_inference_text = clean_symbols(raw_inference_text);

  // ==================== WRITE TEXT TO FILE ==================== //

  info!("Creating tempdir for inference results.");

  let temp_dir = format!("temp_tts_inference_{}", job.id.0);

  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let temp_dir = TempDir::new(&temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  let text_input_fs_path = temp_dir.path().join("inference_input.txt");

  std::fs::write(&text_input_fs_path, &cleaned_inference_text)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  Ok(())
}

#[derive(Deserialize, Default)]
struct FileMetadata {
  pub duration_millis: Option<u64>,
  pub mimetype: Option<String>,
  pub file_size_bytes: u64,
}

fn read_metadata_file(filename: &PathBuf) -> AnyhowResult<FileMetadata> {
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;
  Ok(serde_json::from_str(&buffer)?)
}
