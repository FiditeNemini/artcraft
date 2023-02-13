use std::path::Path;
use errors::AnyhowResult;

/// For serializing OpenAI GPT requests.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RenditionData {
  /// Location the article came from
  pub original_content_url: String,

  /// The prompt we sent to OpenAI
  pub original_prompt: String,

  /// Response from OpenAI
  pub response: String,
}

impl RenditionData {

  pub fn try_from_yaml_file<P: AsRef<Path>>(filename: P) -> AnyhowResult<Self> {
    let file = std::fs::File::open(filename)?;
    let object = serde_yaml::from_reader(file)?;
    Ok(object)
  }

  pub fn write_to_yaml_file<P: AsRef<Path>>(&self, filename: P) -> AnyhowResult<()> {
    let mut file = std::fs::File::create(filename)?;
    serde_yaml::to_writer(file, &self)?;
    Ok(())
  }
}
