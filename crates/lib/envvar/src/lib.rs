//! envvar
//!
//! The purpose of this library is to handle reading environment variables.
//!

// Never allow these
#![forbid(private_in_public)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

// Okay to toggle
#![forbid(unreachable_patterns)]
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]

use std::path::{Path, PathBuf};
use errors::{anyhow, AnyhowResult};

pub fn read_from_filename<P: AsRef<Path>>(filename: P) -> AnyhowResult<PathBuf> {
  let result = dotenv::from_filename(filename)?;
  Ok(result)
}

/// Try loading in an environment file across many search paths (first found wins).
/// Returns an error if no file could be read or if in attempting to read a file there was an error.
pub fn read_from_filename_and_paths<P: AsRef<Path>>(filename: P, paths: &[P]) -> AnyhowResult<()> {
  for path in paths.iter() {
    let path = path.as_ref().join(filename.as_ref());

    if path.exists() && path.is_file() {
      log::info!("Attempting to read env vars from file: {:?}", path);
      let path = std::fs::canonicalize(path)?;
      return Ok(dotenv::from_path(path)?);
    }
  }

  Err(anyhow!("No env file existed for filename {:?} in the search paths {:?}",
    filename.as_ref(),
    paths.iter().map(|p| p.as_ref().to_path_buf()).collect::<Vec<PathBuf>>()))
}
