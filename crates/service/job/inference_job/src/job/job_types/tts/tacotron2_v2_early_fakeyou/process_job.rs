use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use crate::job_dependencies::JobDependencies;
use errors::AnyhowResult;
use mysql_queries::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use mysql_queries::queries::tts::tts_models::get_tts_model_for_inference_improved::TtsModelForInferenceRecord;

/// Text starting with this will be treated as a test request.
/// This allows the request to bypass the model cache and query the latest TTS model.
const TEST_REQUEST_TEXT: &'static str = "This is a test request.";

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

pub async fn process_job(job_dependencies: &JobDependencies, job: &AvailableInferenceJob, tts_model: &TtsModelForInferenceRecord) -> AnyhowResult<()> {

  Ok(())
}
