use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use std::time::Instant;

use anyhow::anyhow;
use log::{error, info};
use tempdir::TempDir;

use container_common::filesystem::check_file_exists::check_file_exists;
use container_common::filesystem::safe_delete_temp_directory::safe_delete_temp_directory;
use container_common::filesystem::safe_delete_temp_file::safe_delete_temp_file;
use enums::by_table::generic_inference_jobs::inference_result_type::InferenceResultType;
use errors::AnyhowResult;
use hashing::sha256::sha256_hash_string::sha256_hash_string;
use mysql_queries::column_types::vocoder_type::VocoderType;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::TtsModelForInferenceRecord;
use mysql_queries::queries::tts::tts_results::insert_tts_result::{insert_tts_result, JobType};
use tts_common::clean_symbols::clean_symbols;
use tts_common::text_pipelines::guess_pipeline::guess_text_pipeline_heuristic;
use tts_common::text_pipelines::text_pipeline_type::TextPipelineType;

use crate::job::job_loop::job_success_result::{JobSuccessResult, ResultEntity};
use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::download_static_dependencies::download_static_dependencies;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::health_check_trap::maybe_block_on_sidecar_health_check;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::seconds_to_decoder_steps::seconds_to_decoder_steps;
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::tacotron2_inference_command::{InferenceArgs, MelMultiplyFactor};
use crate::job::job_types::tts::tacotron2_v2_early_fakeyou::vocoder_option::VocoderForInferenceOption;
use crate::job_dependencies::JobDependencies;
use crate::util::maybe_download_file_from_bucket::{maybe_download_file_from_bucket, MaybeDownloadArgs};

/// Text starting with this will be treated as a test request.
/// This allows the request to bypass the model cache and query the latest TTS model.
const TEST_REQUEST_TEXT: &str = "This is a test request.";

pub struct ProcessJobArgs<'a> {
  pub job_dependencies: &'a JobDependencies,
  pub job: &'a AvailableInferenceJob,
  pub tts_model: &'a TtsModelForInferenceRecord,
  pub raw_inference_text: &'a str,
}

pub async fn process_job(args: ProcessJobArgs<'_>) -> Result<JobSuccessResult, ProcessSingleJobError> {
  let work_temp_dir = format!("temp_tt2_inference_{}", args.job.id.0);

  // for FILE in tmp*; do echo $FILE && rm -r $FILE ; done
  // for file in `ls -tr | grep tmp`; do echo $file && rm -r $file ; done
  // NB: TempDir exists until it goes out of scope, at which point it should delete from filesystem.
  let work_temp_dir = args.job_dependencies
      .fs
      .scoped_temp_dir_creator_for_work
      .new_tempdir(&work_temp_dir)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  let result = process_job_with_cleanup(args, &work_temp_dir).await;

  // NB: The first time TT2 on inference-job was deployed, the filesystem filled up with
  // temporary directories. This is just being abundantly safe.
  info!("(After job cleanup) Deleting temp directory: {:?}", work_temp_dir.path());
  safe_delete_temp_directory(&work_temp_dir);

  result
}

async fn process_job_with_cleanup(
  args: ProcessJobArgs<'_>,
  work_temp_dir: &TempDir,
) -> Result<JobSuccessResult, ProcessSingleJobError> {

  let job = args.job;
  let tts_model = args.tts_model;
  let raw_inference_text = args.raw_inference_text;

  let mut job_progress_reporter = args.job_dependencies
      .clients
      .job_progress_reporter
      .new_generic_inference(job.inference_job_token.as_str())
      .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  let model_dependencies = args
      .job_dependencies
      .job
      .job_specific_dependencies
      .maybe_tacotron2_dependencies
      .as_ref()
      .ok_or_else(|| ProcessSingleJobError::JobSystemMisconfiguration(Some("missing Tacotron2 dependencies".to_string())))?;

  // ==================== OPTIONAL SIDECAR HEALTH CHECK ==================== //

  // TODO(bt,2023-11-28): Ideally we'd perform health checks before grabbing a lock on the job.
  let maybe_needs_health_check =
      model_dependencies.sidecar.use_sidecar_instead_of_shell &&
          model_dependencies.sidecar.health_check_state.needs_health_check()
              .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;

  if maybe_needs_health_check {
    maybe_block_on_sidecar_health_check(&model_dependencies.sidecar.health_check_client).await;

    model_dependencies.sidecar.health_check_state.mark_maybe_needs_health_check(false)
        .map_err(|e| ProcessSingleJobError::Other(anyhow!(e)))?;
  }

  // ==================== CONFIRM OR DOWNLOAD STATIC DEPENDENCIES ==================== //

  let static_deps = download_static_dependencies(
    &args.job_dependencies,
    &job,
    &model_dependencies,
    &mut job_progress_reporter,
  ).await?;

  // ==================== CONFIRM OR DOWNLOAD OPTIONAL CUSTOM VOCODER MODEL ==================== //

  let custom_vocoder_fs_path = match &tts_model.maybe_custom_vocoder {
    None => None,
    Some(vocoder) => {
      let custom_vocoder_fs_path = args.job_dependencies.fs.semi_persistent_cache.custom_vocoder_model_path(&vocoder.vocoder_token);
      let custom_vocoder_object_path  = args.job_dependencies.buckets.bucket_path_unifier.vocoder_path(&vocoder.vocoder_private_bucket_hash);

      maybe_download_file_from_bucket(MaybeDownloadArgs {
        name_or_description_of_file: "custom vocoder",
        final_filesystem_file_path: &custom_vocoder_fs_path,
        bucket_object_path: &custom_vocoder_object_path,
        bucket_client: &args.job_dependencies.buckets.private_bucket_client,
        job_progress_reporter: &mut job_progress_reporter,
        job_progress_update_description: "downloading user vocoder",
        job_id: job.id.0,
        scoped_tempdir_creator: &args.job_dependencies.fs.scoped_temp_dir_creator_for_short_lived_downloads,
        maybe_existing_file_minimum_size_required: Some(1000),
      }).await?;

      Some(custom_vocoder_fs_path)
    }
  };

  // ==================== CONFIRM OR DOWNLOAD TTS SYNTHESIZER MODEL ==================== //

  let tts_synthesizer_fs_path = {
    let tts_synthesizer_fs_path = args.job_dependencies.fs.semi_persistent_cache.tts_synthesizer_model_path(tts_model.model_token.as_str());
    let tts_synthesizer_object_path  = args.job_dependencies.buckets.bucket_path_unifier.tts_synthesizer_path(&tts_model.private_bucket_hash);

    maybe_download_file_from_bucket(MaybeDownloadArgs {
      name_or_description_of_file: "synthesizer",
      final_filesystem_file_path: & tts_synthesizer_fs_path,
      bucket_object_path: &tts_synthesizer_object_path,
      bucket_client: &args.job_dependencies.buckets.private_bucket_client,
      job_progress_reporter: &mut job_progress_reporter,
      job_progress_update_description: "downloading synthesizer",
      job_id: job.id.0,
      scoped_tempdir_creator: &args.job_dependencies.fs.scoped_temp_dir_creator_for_short_lived_downloads,
      maybe_existing_file_minimum_size_required: Some(1000),
    }).await?;

    tts_synthesizer_fs_path
  };

  // ==================== Preprocess text ==================== //

  let cleaned_inference_text = clean_symbols(raw_inference_text);

  // ==================== WRITE TEXT TO FILE ==================== //

  info!("Creating tempdir for inference results.");

  let text_input_fs_path = work_temp_dir.path().join("inference_input.txt");

  std::fs::write(&text_input_fs_path, &cleaned_inference_text)
      .map_err(|e| ProcessSingleJobError::from_io_error(e))?;

  // ==================== SETUP FOR INFERENCE ==================== //

  job_progress_reporter.log_status("running inference")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let output_audio_fs_path = work_temp_dir.path().join("output.wav");
  let output_metadata_fs_path = work_temp_dir.path().join("metadata.json");
  let output_spectrogram_fs_path = work_temp_dir.path().join("spectrogram.json");

  info!("Running TTS inference...");

  info!("Expected output audio filename: {:?}", &output_audio_fs_path);
  info!("Expected output spectrogram filename: {:?}", &output_spectrogram_fs_path);
  info!("Expected output metadata filename: {:?}", &output_metadata_fs_path);

  let mut pretrained_vocoder = VocoderType::HifiGanSuperResolution;
  if let Some(default_vocoder) = tts_model.maybe_default_pretrained_vocoder.as_deref() {
    pretrained_vocoder = VocoderType::from_str(default_vocoder)
        .map_err(|e| ProcessSingleJobError::Other(e))?;
  }

  info!("With pretrained vocoder: {:?}", pretrained_vocoder);

  // TODO: Clean up the vocoder selection logic to make this crystal clear.
  let mut vocoder_option = match pretrained_vocoder {
    // We most likely will *not* use WaveGlow.
    VocoderType::WaveGlow => {
      VocoderForInferenceOption::Waveglow {
        waveglow_vocoder_checkpoint_path: &static_deps.waveglow_vocoder_model_fs_path
      }
    }
    VocoderType::HifiGanSuperResolution => {
      VocoderForInferenceOption::HifiganSuperres {
        hifigan_vocoder_checkpoint_path: &static_deps.pretrained_hifigan_vocoder_model_fs_path,
        hifigan_superres_vocoder_checkpoint_path: &static_deps.hifigan_superres_vocoder_model_fs_path,
      }
    }
  };

  if let Some(ref custom_vocoder_path) = custom_vocoder_fs_path {
      info!("using custom user-trained HiFi-GAN vocoder: {:?}", custom_vocoder_fs_path);
      vocoder_option = VocoderForInferenceOption::HifiganSuperres {
        hifigan_vocoder_checkpoint_path: custom_vocoder_path,
        hifigan_superres_vocoder_checkpoint_path: &static_deps.hifigan_superres_vocoder_model_fs_path,
      };
  };

  let text_pipeline_type_or_guess = tts_model.text_pipeline_type
      .as_deref()
      // NB: If there's an error deserializing, turn it to None.
      .and_then(|pipeline_type| TextPipelineType::from_str(pipeline_type).ok())
      .unwrap_or_else(|| guess_text_pipeline_heuristic(Some(tts_model.created_at)));

  info!("With text pipeline type `{:?} ` (or guess: {:?})",
    &tts_model.text_pipeline_type,
    &text_pipeline_type_or_guess);

  // NB: Tacotron operates on decoder steps. 1000 steps is the default and correlates to
  //  roughly 12 seconds max. Here we map seconds to decoder steps.
  let max_decoder_steps = seconds_to_decoder_steps(job.max_duration_seconds);

  // ==================== RUN INFERENCE SCRIPT ==================== //

  let mut maybe_mel_multiply_factor = None;

  if let Some(factor) = tts_model.maybe_custom_mel_multiply_factor {
    maybe_mel_multiply_factor = Some(MelMultiplyFactor::CustomMultiplyFactor(factor));
  } else if tts_model.use_default_mel_multiply_factor {
    maybe_mel_multiply_factor = Some(MelMultiplyFactor::DefaultMultiplyFactor);
  }

  let maybe_unload_model_path = model_dependencies
      .sidecar
      .virtual_lfu_cache
      .insert_returning_replaced(tts_synthesizer_fs_path.to_str().unwrap_or(""))
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  if let Some(model_path) = maybe_unload_model_path.as_deref() {
    info!("Remove model from sidecar LFU cache: {:?}", model_path);
  }

  let inference_start_time = Instant::now();

  if model_dependencies.sidecar.use_sidecar_instead_of_shell {
    info!("Calling inference sidecar...");
    let _r = model_dependencies.sidecar.inference_client.request_inference(
      &cleaned_inference_text,
      max_decoder_steps,
      &tts_synthesizer_fs_path,
      &text_pipeline_type_or_guess.to_str(),
      vocoder_option,
      &output_audio_fs_path,
      &output_spectrogram_fs_path,
      &output_metadata_fs_path,
      maybe_unload_model_path,
      tts_model.use_default_mel_multiply_factor,
      tts_model.maybe_custom_mel_multiply_factor,
    ).await.map_err(|e| ProcessSingleJobError::Other(e))?;
  } else {
    info!("Shelling out for inference...");
    let _r = model_dependencies.inference_command.execute_inference(InferenceArgs {
      synthesizer_checkpoint_path: &tts_synthesizer_fs_path,
      text_pipeline_type: text_pipeline_type_or_guess.to_str(),
      vocoder: vocoder_option,
      maybe_mel_multiply_factor,
      max_decoder_steps,
      input_text_filename: &text_input_fs_path,
      output_audio_filename: &output_audio_fs_path,
      output_spectrogram_filename: &output_spectrogram_fs_path,
      output_metadata_filename: &output_metadata_fs_path,
    });
  }

  let inference_duration = Instant::now().duration_since(inference_start_time);

  info!("Inference took duration to complete: {:?}", &inference_duration);

  // ==================== CHECK ALL FILES EXIST AND GET METADATA ==================== //

  info!("Checking that output files exist...");

  check_file_exists(&output_audio_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;
  check_file_exists(&output_spectrogram_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;
  check_file_exists(&output_metadata_fs_path).map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("All required files exist!");

  info!("Reading metadata file...");

  let file_metadata = read_metadata_file(&output_metadata_fs_path)
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Deleting metadata file...");

  safe_delete_temp_file(&output_metadata_fs_path);

  // ==================== UPLOAD AUDIO TO BUCKET ==================== //

  job_progress_reporter.log_status("uploading result")
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  let audio_result_object_path = args.job_dependencies.buckets.bucket_path_unifier.tts_inference_wav_audio_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Audio destination bucket path: {:?}", &audio_result_object_path);

  info!("Uploading audio...");

  args.job_dependencies.buckets.public_bucket_client.upload_filename_with_content_type(
    &audio_result_object_path,
    &output_audio_fs_path,
    "audio/wav")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_audio_fs_path);

  // ==================== UPLOAD SPECTROGRAM TO BUCKETS ==================== //

  let spectrogram_result_object_path = args.job_dependencies.buckets.bucket_path_unifier.tts_inference_spectrogram_output_path(
    &job.uuid_idempotency_token); // TODO: Don't use this!

  info!("Spectrogram destination bucket path: {:?}", &spectrogram_result_object_path);

  info!("Uploading spectrogram...");

  args.job_dependencies.buckets.public_bucket_client.upload_filename_with_content_type(
    &spectrogram_result_object_path,
    &output_spectrogram_fs_path,
    "application/json")
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  safe_delete_temp_file(&output_spectrogram_fs_path);

  // ==================== DELETE DOWNLOADED FILE ==================== //

  // NB: We should be using a tempdir, but to make absolutely certain we don't overflow the disk...
  safe_delete_temp_directory(&work_temp_dir.path());

  // ==================== SAVE RECORDS ==================== //

  let text_hash = sha256_hash_string(&cleaned_inference_text)
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("Saving tts inference record...");

  let (id, inference_result_token) = insert_tts_result(
    &args.job_dependencies.db.mysql_pool,
    JobType::GenericInferenceJob(&job),
    &text_hash,
    Some(pretrained_vocoder),
    &audio_result_object_path,
    &spectrogram_result_object_path,
    file_metadata.file_size_bytes,
    file_metadata.duration_millis.unwrap_or(0),
    args.job_dependencies.job.info.container.is_on_prem,
    &args.job_dependencies.job.info.container.hostname,
    args.job_dependencies.job.system.is_debug_worker)
      .await
      .map_err(|e| ProcessSingleJobError::Other(e))?;

  info!("TTS Done. Original text was: {:?}", &job.maybe_raw_inference_text);

  args.job_dependencies.clients.firehose_publisher.tts_inference_finished(
    job.maybe_creator_user_token.as_deref(),
    tts_model.model_token.as_str(),
    &inference_result_token)
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
      entity_type: InferenceResultType::TextToSpeech,
      entity_token: inference_result_token
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

fn read_metadata_file(filename: &PathBuf) -> AnyhowResult<FileMetadata> {
  let mut file = File::open(filename)?;
  let mut buffer = String::new();
  file.read_to_string(&mut buffer)?;
  Ok(serde_json::from_str(&buffer)?)
}
