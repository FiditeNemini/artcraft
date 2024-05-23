use std::collections::HashSet;
use std::io::{BufReader, Cursor};
use std::path::{Path, PathBuf};

use log::{error, info, warn};
use once_cell::sync::Lazy;
use zip::ZipArchive;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use cloud_storage::bucket_client::BucketClient;
use errors::AnyhowResult;
use hashing::sha256::sha256_hash_bytes::sha256_hash_bytes;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use crate::http_server::endpoints::media_files::upload::upload_error::MediaFileUploadError;

static ALLOWED_EXTENSIONS : Lazy<HashSet<&'static str>> = Lazy::new(|| {
  HashSet::from([
    ".pmx",
    ".png",
    ".tga",
  ])
});

#[derive(Debug)]
pub enum PmxError {
  InvalidArchive,
  TooManyFiles,
  TooManyPmxFiles,
  NoPmxFile,
  UploadError,
  FileError,
}

pub struct PmxDetails {
  pub pmx_public_upload_path: MediaFileBucketPath,
  pub sha256_checksum: String,
  pub file_size_bytes: u64,
  pub maybe_mime_type: Option<String>,
}

pub async fn extract_and_upload_pmx_files(
  file_bytes: &[u8],
  bucket_client: &BucketClient,
  prefix: Option<&str>,
  suffix: Option<&str>
) -> Result<PmxDetails, PmxError> {

  let maybe_mimetype = get_mimetype_for_bytes(file_bytes);

  if maybe_mimetype != Some("application/zip") {
    warn!("File must be an application/zip");
    return Err(PmxError::InvalidArchive);
  }

  let mut cursor = Cursor::new(file_bytes);
  let reader = std::io::BufReader::new(cursor);
  let mut archive = zip::ZipArchive::new(reader)
      .map_err(|err| {
        error!("Problem reading zip archive: {:?}", err);
        PmxError::InvalidArchive
      })?;

  if archive.len() > 255 {
    return Err(PmxError::TooManyFiles);
  }

  let pmx_public_upload_path = MediaFileBucketPath::generate_new(prefix, suffix);
  let pmx_public_upload_directory = pmx_public_upload_path.get_directory().get_directory_path_str();

  // TODO(bt): Fix these
  let mut hash = "";
  let mut file_size_bytes = 0;

  info!("Reading archive contents...");

  let result = get_pmx_entries(&mut archive);


  for i in 0..(archive.len()) {
    info!("Reading file {}...", i);

    let mut file = archive.by_index(i)
        .map_err(|err| {
          error!("Problem reading file from archive: {:?}", err);
          PmxError::InvalidArchive
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

    if filename_lowercase.ends_with(".pmx") {
      bucket_client.upload_file_with_content_type(
        pmx_public_upload_path.get_full_object_path_str(),
        file_bytes.as_ref(),
        "application/octet-stream")
          .await
          .map_err(|e| {
            warn!("Upload media bytes (pmx) to bucket error: {:?}", e);
            PmxError::UploadError
          })?;

      let hash = sha256_hash_bytes(&file_bytes)
          .map_err(|io_error| {
            error!("Problem hashing bytes: {:?}", io_error);
            PmxError::FileError
          })?;

      let file_size_bytes = file_bytes.len();

    } else {
      let path = format!("{}/{}", pmx_public_upload_directory, filename);

      let mimetype = get_mimetype_for_bytes(file_bytes)
          .unwrap_or("application/octet-stream");
      bucket_client.upload_file_with_content_type(
        &path,
        file_bytes.as_ref(),
        mimetype)
          .await
          .map_err(|e| {
            warn!("Upload media bytes (non-pmx) to bucket error: {:?}", e);
            PmxError::UploadError
          })?;
    }
  }

  Ok(PmxDetails {
    pmx_public_upload_path,
    sha256_checksum: hash.to_string(),
    file_size_bytes: file_size_bytes as u64,
    maybe_mime_type: Some("application/octet-stream".to_string()),
  })
}

#[derive(Debug)]
struct PmxEntryDetail {
  path: PathBuf,
  is_pmx: bool,
}

fn get_pmx_entries(archive: &mut ZipArchive<BufReader<Cursor<&[u8]>>>) -> Result<Vec<PmxEntryDetail>, PmxError> {
  let mut entries = Vec::new();

  for i in 0..(archive.len()) {
    info!("Reading file {}...", i);

    let mut file = archive.by_index(i)
        .map_err(|err| {
          error!("Problem reading file from archive: {:?}", err);
          PmxError::InvalidArchive
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
      None => return Err(PmxError::FileError),
      Some(name) => name,
    };

    if filename_lowercase.ends_with(".pmx") {
      entries.push(PmxEntryDetail {
        path: enclosed_name.to_path_buf(),
        is_pmx: true,
      });
    } else {
      // TODO(bt): Check type
      entries.push(PmxEntryDetail {
        path: enclosed_name.to_path_buf(),
        is_pmx: false,
      })
    }
  }

  let mut maybe_parent_directory_to_remove = None;

  {
    let pmx_entry = entries.iter()
        .filter(|entry| entry.is_pmx)
        .collect::<Vec<&PmxEntryDetail>>();

    if pmx_entry.len() != 1 {
      return Err(PmxError::TooManyPmxFiles);
    }

    match pmx_entry.get(0) {
      None => return Err(PmxError::NoPmxFile),
      Some(pmx_file) => {
        maybe_parent_directory_to_remove = pmx_file.path.parent().map(|p| p.to_path_buf());
      }
    }
  }

  for entry in entries.iter() {
    info!("Entry: {:?}", entry);
  }

  if let Some(parent) = maybe_parent_directory_to_remove {
    info!("Common parent: {:?}", parent);

    let remove_parent = entries.iter()
        .all(|entry| entry.path.starts_with(&parent));

    if remove_parent {
      entries = entries.into_iter()
          .map(|entry| {
            let new_path = entry.path.strip_prefix(&parent)
                .map(|path| path.to_path_buf())
                .unwrap_or_else(|_err| entry.path.clone());
            PmxEntryDetail {
              path: new_path,
              is_pmx: entry.is_pmx,
            }
          })
          .collect::<Vec<PmxEntryDetail>>();
    }
  }

  for entry in entries.iter() {
    info!("Entry: {:?}", entry);
  }

  Ok(entries)
}


