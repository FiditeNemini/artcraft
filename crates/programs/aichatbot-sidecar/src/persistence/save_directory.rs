use std::path::{Path, PathBuf};
use log::info;
use path_absolutize::Absolutize;

#[derive(Clone)]
pub struct SaveDirectory {
  directory: PathBuf,
}

impl SaveDirectory {

  pub fn new<P: AsRef<Path>>(directory: P) -> Self {
    Self {
      directory: directory.as_ref().to_path_buf()
    }
  }

  /// This is just the first directory structure, which is sequential audio files.
  /// We'll be using a database and well-formed filesystem layout later.
  pub fn get_audio_files_dir_v1(&self) -> PathBuf {
    let result = self.directory.join("audio_files");
    info!("SD(1): {:?}", result);
    info!("SD(2): {:?}", result.canonicalize());
    //let result = result.canonicalize().unwrap_or(result);
    //info!("SD(3): {:?}", result);
    let result = result.absolutize()
        .map(|file| file.to_path_buf())
        .unwrap_or(result);
    info!("SD(4): {:?}", result);
    result
  }
}
