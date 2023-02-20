use std::path::Path;
use errors::AnyhowResult;

/// For serializing Image Generation responses for debugging
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ImageGenerationDebugData {
  /// Prompt used to generate the image
  pub image_generation_prompt: String,

  /// We might have created a prompt to generate a prompt.
  pub maybe_preconditioning_prompt: Option<String>,
}

impl ImageGenerationDebugData {

  //pub fn try_from_yaml_file<P: AsRef<Path>>(filename: P) -> AnyhowResult<Self> {
  //  let file = std::fs::File::open(filename)?;
  //  let object = serde_yaml::from_reader(file)?;
  //  Ok(object)
  //}

  pub fn write_to_yaml_file<P: AsRef<Path>>(&self, filename: P) -> AnyhowResult<()> {
    let mut file = std::fs::File::create(filename)?;
    serde_yaml::to_writer(file, &self)?;
    Ok(())
  }
}
