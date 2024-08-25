use std::collections::{HashMap, HashSet};
use std::io::{BufReader, Cursor, Read};
use std::path::{Path, PathBuf};

use log::{error, info, warn};
use once_cell::sync::Lazy;
use zip::ZipArchive;

use filesys::path_to_string::path_to_string;

use crate::http_server::web_utils::open_zip_archive::{open_zip_archive, OpenZipError};

static ALLOWED_FRAME_EXTENSIONS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
  HashSet::from([
    ".png",
    ".jpg",
  ])
});

const TOO_MANY_FILES_COUNT: usize = 8_000;

#[derive(Debug)]
pub enum ExtractFramesError {
  InvalidArchive,
  NoImageFiles,
  TooFewImageFiles,
  TooManyFiles,
  ExtractionError,
  UploadError,
  FileError,
}

pub fn extract_frames_from_zip<P: AsRef<Path>>(
  zip_container_file_bytes: &[u8],
  frame_temp_dir: P,
) -> Result<(), ExtractFramesError> {

  info!("Opening archive...");

  let mut archive = match open_zip_archive(zip_container_file_bytes, Some(TOO_MANY_FILES_COUNT)) {
    Ok(archive) => archive,
    Err(OpenZipError::InvalidArchive) => return Err(ExtractFramesError::InvalidArchive),
    Err(OpenZipError::TooManyFiles) => return Err(ExtractFramesError::TooManyFiles),
  };

  info!("Reading archive contents...");

  let entries = get_relevant_zip_entries(&mut archive)?;

  for entry in entries.iter() {
    info!("Entry: {:?}", entry);

    if !entry.is_frame {
      info!("Skipping entry (not a frame): {:?}", entry);
      continue;
    }

    let safe_enclosed_name = path_to_string(&entry.safe_enclosed_name);

    let mut file = archive.by_name(&safe_enclosed_name)
        .map_err(|err| {
          error!("Problem reading file from archive: {:?}", err);
          ExtractFramesError::InvalidArchive
        })?;

    let maybe_filesystem_name = entry.safe_enclosed_name.file_name()
        .map(|s| s.to_str())
        .flatten();

    let filesystem_name = match maybe_filesystem_name {
      None => continue,
      Some(name) => name,
    };

    let output_path = frame_temp_dir.as_ref().join(filesystem_name);

    let mut output_file = std::fs::File::create(&output_path)
        .map_err(|err| {
          error!("Problem creating file {:?} : {:?}", output_path, err);
          ExtractFramesError::ExtractionError
        })?;

    std::io::copy(&mut file, &mut output_file)
        .map_err(|err| {
          error!("Problem copying file bytes {:?} : {:?}", output_path, err);
          ExtractFramesError::ExtractionError
        })?;
  }

  Ok(())
}

#[derive(Debug, Clone)]
struct FrameEntryDetail {
  safe_enclosed_name: PathBuf,
  is_frame: bool,
  //file_size: u64,
  //maybe_better_alternative_output_name: Option<PathBuf>,
  //sequence_number: u64, // Based on the filename, e.g. "0001.png" -> 1
}

fn get_relevant_zip_entries(archive: &mut ZipArchive<BufReader<Cursor<&[u8]>>>) -> Result<Vec<FrameEntryDetail>, ExtractFramesError> {
  let mut entries = Vec::new();

  for i in 0..(archive.len()) {
    info!("Reading file {}...", i);

    let mut file = archive.by_index(i)
        .map_err(|err| {
          error!("Problem reading file from archive: {:?}", err);
          ExtractFramesError::InvalidArchive
        })?;

    let filename = file.name();
    let filename_lowercase = filename.to_lowercase();

    info!("File {} is {:?} - is file = {}", i, filename, file.is_file());
    info!("Enclosed name: {:?}", file.enclosed_name());

    if file.is_dir() {
      continue;
    }

    if filename_lowercase.starts_with("__macosx/") {
      // Mac users sometimes have a bogus __MACOSX directory, which may double the file count.
      continue;
    }

    let enclosed_name = match file.enclosed_name() {
      None => return Err(ExtractFramesError::FileError),
      Some(name) => name,
    };

    let file_is_frame = ALLOWED_FRAME_EXTENSIONS.iter()
        .any(|ext| filename_lowercase.ends_with(ext));

    if file_is_frame {
      entries.push(FrameEntryDetail {
        safe_enclosed_name: enclosed_name.to_path_buf(),
        is_frame: true,
        //maybe_better_alternative_output_name: None,
        //file_size: file.size(),
      });
    }

    // TODO: We may have metadata files or sound files in the future.
  }

  for entry in entries.iter() {
    info!("Entry: {:?}", entry);
  }

  Ok(entries)
}
