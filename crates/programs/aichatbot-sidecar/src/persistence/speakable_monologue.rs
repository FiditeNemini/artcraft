use std::path::Path;
use errors::AnyhowResult;

/// For handing off to FakeYou for audio generation
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SpeakableMonologue {
  /// Paragraphs to speak
  pub paragraphs: Vec<String>,
}

impl SpeakableMonologue {

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
