use std::{fs, fmt};
use std::error::Error;
use std::fmt::{Display, Formatter};
use std::env::VarError;

// This is a stupid hack. There's no real need for a build script.
// Windows loses the `k4a.lib` library in the target/*/libs dir on subsequent builds,
// so this just copies it there. I just need to fix the upstream kinect library...

#[derive(Debug)]
pub struct BuildError {
  pub description: String,
}

pub fn main() -> Result<(), BuildError> {
  if cfg!(target_os = "windows") {
    let profile = std::env::var("PROFILE")?;
    let destination = format!("target/{}/deps/k4a.lib", &profile);
    fs::copy("vendor/k4a.lib", &destination)?;
  }

  Ok(())
}

impl Display for BuildError {
  fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
    write!(f, "BuildError: {}", &self.description)
  }
}

impl From<std::io::Error> for BuildError {
  fn from(err: std::io::Error) -> Self {
    BuildError {
      description: format!("IoError: {:?}", err)
    }
  }
}
impl From<VarError> for BuildError {
  fn from(err: VarError) -> Self {
    BuildError {
      description: format!("VarError: {:?}", err)
    }
  }
}

