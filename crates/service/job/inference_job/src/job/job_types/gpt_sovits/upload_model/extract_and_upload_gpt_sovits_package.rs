use std::io::{BufReader, Cursor, Read, Seek};
use std::path::PathBuf;

use log::{error, info, warn};
use zip::ZipArchive;

use buckets::public::weight_files::bucket_directory::WeightFileBucketDirectory;
use buckets::public::weight_files::bucket_file_path::WeightFileBucketPath;
use cloud_storage::bucket_client::BucketClient;
use filesys::path_to_string::path_to_string;
use hashing::sha256::sha256_hash_bytes::sha256_hash_bytes;

use crate::job::job_types::gpt_sovits::model_package::model_package::{GptSovitsPackageDetails, GptSovitsPackageError, GptSovitsPackageFile, GptSovitsPackageFileType};

pub async fn extract_and_upload_gpt_sovits_package_files(
  zip_container_file_bytes: &[u8],
  bucket_client: &BucketClient,
  weights_file_bucket_directory: &WeightFileBucketDirectory,
) -> Result<GptSovitsPackageDetails, GptSovitsPackageError> {
  let cursor = Cursor::new(zip_container_file_bytes);
  let reader = BufReader::new(cursor);
  let mut archive = ZipArchive::new(reader)
    .map_err(|err| {
      error!("Error reading zip archive: {:?}", err);
      GptSovitsPackageError::InvalidArchive
    })?;

  if archive.len() > 255 {
    return Err(GptSovitsPackageError::TooManyFiles);
  }

  let mut gpt_model: Option<GptSovitsPackageFile> = None;
  let mut sovits_checkpoint: Option<GptSovitsPackageFile> = None;
  let mut reference_audio: Option<GptSovitsPackageFile> = None;
  let mut reference_transcript : Option<GptSovitsPackageFile> = None;

  let entries = get_relevant_zip_entries(&mut archive)?;

  for entry in entries.iter() {
    info!("Entry: {:?}", entry);

    let enclosed_name = path_to_string(&entry.enclosed_name);

    let mut file = archive.by_name(&enclosed_name)
      .map_err(|err| {
        error!("Problem reading file from archive: {:?}", err);
        GptSovitsPackageError::InvalidArchive
      })?;

    let mut zip_item_bytes = Vec::new();

    file.read_to_end(&mut zip_item_bytes)
      .map_err(|err| {
        error!("Problem reading file from archive: {:?}", err);
        GptSovitsPackageError::ExtractionError
      })?;

    match entry.package_type {
      GptSovitsPackageFileType::GptModel => {
        let bucket_public_upload_path = WeightFileBucketPath::from_object_hash(
          weights_file_bucket_directory.get_object_hash(),
          Some("weight_"),
          Some(&entry.package_type.get_expected_package_suffix()),
        );
        info!("Uploading GPT model to: {}", bucket_public_upload_path.get_full_object_path_str());
        bucket_client.upload_file(
          bucket_public_upload_path.get_full_object_path_str(),
          zip_item_bytes.as_ref())
          .await
          .map_err(|e| {
            warn!("Upload gpt package to bucket error: {:?}", e);
            GptSovitsPackageError::UploadError
          })?;

        let hash = sha256_hash_bytes(&zip_item_bytes)
          .map_err(|io_error| {
            error!("Problem hashing bytes: {:?}", io_error);
            GptSovitsPackageError::UploadError
          })?;

        let file_size_bytes = zip_item_bytes.len();

        gpt_model = Some(GptSovitsPackageFile {
          public_upload_path: bucket_public_upload_path,
          sha256_checksum: hash,
          file_size_bytes: file_size_bytes as u64,
        });
      },
      GptSovitsPackageFileType::SovitsCheckpoint => {
        let bucket_public_upload_path = WeightFileBucketPath::from_object_hash(
          weights_file_bucket_directory.get_object_hash(),
          Some("weight_"),
          Some(&entry.package_type.get_expected_package_suffix()),
        );
        info!("Uploading sovits checkpoint to {:?}", bucket_public_upload_path.get_full_object_path_str());
        bucket_client.upload_file(
          bucket_public_upload_path.get_full_object_path_str(),
          zip_item_bytes.as_ref())
          .await
          .map_err(|e| {
            warn!("Upload sovits package to bucket error: {:?}", e);
            GptSovitsPackageError::UploadError
          })?;

        let hash = sha256_hash_bytes(&zip_item_bytes)
          .map_err(|io_error| {
            error!("Problem hashing bytes: {:?}", io_error);
            GptSovitsPackageError::UploadError
          })?;

        let file_size_bytes = zip_item_bytes.len();

        sovits_checkpoint = Some(GptSovitsPackageFile {
          public_upload_path: bucket_public_upload_path,
          sha256_checksum: hash,
          file_size_bytes: file_size_bytes as u64,
        });
      },
      GptSovitsPackageFileType::ReferenceAudio => {
        let bucket_public_upload_path = WeightFileBucketPath::from_object_hash(
          weights_file_bucket_directory.get_object_hash(),
          Some("weight_"),
          Some(&entry.package_type.get_expected_package_suffix()),
        );
        info!("Uploading reference audio package to {:?}", bucket_public_upload_path.get_full_object_path_str());
        bucket_client.upload_file(
          bucket_public_upload_path.get_full_object_path_str(),
          zip_item_bytes.as_ref())
          .await
          .map_err(|e| {
            warn!("Upload reference audio package to bucket error: {:?}", e);
            GptSovitsPackageError::UploadError
          })?;

        let hash = sha256_hash_bytes(&zip_item_bytes)
          .map_err(|io_error| {
            error!("Problem hashing bytes: {:?}", io_error);
            GptSovitsPackageError::UploadError
          })?;

        let file_size_bytes = zip_item_bytes.len();

        reference_audio = Some(GptSovitsPackageFile {
          public_upload_path: bucket_public_upload_path,
          sha256_checksum: hash,
          file_size_bytes: file_size_bytes as u64,
        });
      },
      GptSovitsPackageFileType::ReferenceTranscript => {
        let bucket_public_upload_path = WeightFileBucketPath::from_object_hash(
          weights_file_bucket_directory.get_object_hash(),
          Some("weight_"),
          Some(&entry.package_type.get_expected_package_suffix()),
        );
        info!("Uploading reference transcript package to {:?}", bucket_public_upload_path.get_full_object_path_str());
        bucket_client.upload_file(
          bucket_public_upload_path.get_full_object_path_str(),
          zip_item_bytes.as_ref())
            .await
            .map_err(|e| {
              warn!("Upload reference transcript package to bucket error: {:?}", e);
              GptSovitsPackageError::UploadError
            })?;

        let hash = sha256_hash_bytes(&zip_item_bytes)
            .map_err(|io_error| {
              error!("Problem hashing bytes: {:?}", io_error);
              GptSovitsPackageError::UploadError
            })?;

        let file_size_bytes = zip_item_bytes.len();

        reference_transcript = Some(GptSovitsPackageFile {
          public_upload_path: bucket_public_upload_path,
          sha256_checksum: hash,
          file_size_bytes: file_size_bytes as u64,
        });
      },
    }
  }

  Ok(GptSovitsPackageDetails {
    gpt_model: gpt_model.ok_or(GptSovitsPackageError::InvalidArchive)?,
    sovits_checkpoint: sovits_checkpoint.ok_or(GptSovitsPackageError::InvalidArchive)?,
    reference_audio: reference_audio.ok_or(GptSovitsPackageError::InvalidArchive)?,
    reference_transcript: reference_transcript.ok_or(GptSovitsPackageError::InvalidArchive)?,
  })
}

#[derive(Debug,Clone)]
pub struct PackageZipEntryDetails {
  package_type: GptSovitsPackageFileType,
  enclosed_name: PathBuf,
  maybe_better_alternative_output_name: String,
  file_size: u64,
  is_valid_file_extension: bool,
}

fn get_relevant_zip_entries<R: Read + Seek>(archive: &mut ZipArchive<BufReader<R>>) -> Result<Vec<PackageZipEntryDetails>, GptSovitsPackageError> {
  let mut entries: Vec<PackageZipEntryDetails> = Vec::new();

  for i in 0..archive.len() {
    info!("Reading file {}...", i);

    let file = archive.by_index(i)
      .map_err(|err| {
        error!("Problem reading file from archive: {:?}", err);
        GptSovitsPackageError::InvalidArchive
      })?;

    let filename = file.name();
    let filename_lowercase = filename.to_lowercase();

    info!("File {} is {:?} - is file = {}", i, filename, file.is_file());
    info!("Enclosed name: {:?}", file.enclosed_name());

    if file.is_dir() {
      info!("Skipping directory: {:?}", filename);
      continue;
    }

    if filename_lowercase.starts_with("__macosx/") {
      info!("Skipping __MACOSX directory entry: {:?}", filename);
      // Mac users sometimes have a bogus __MACOSX directory, which may double the file count.
      continue;
    }

    let enclosed_name = match file.enclosed_name() {
      None => return Err(GptSovitsPackageError::FileError),
      Some(name) => name,
    };

    let extension = enclosed_name.extension()
      .map(|ext| ext.to_str().unwrap_or(""))
      .unwrap_or("");
    
    info!("Attempting to process file with name {} extension: {}", enclosed_name.display(), extension);

    match GptSovitsPackageFileType::for_extension(extension) {
      None => {
        info!("Skipping file with name {} extension: {}", enclosed_name.display(), extension);
      }
      Some(package_type) => {
        if entries.iter().any(|entry| &entry.package_type == &package_type) {
          return match package_type {
            GptSovitsPackageFileType::GptModel => {
              Err(GptSovitsPackageError::InvalidGPTModel("Multiple GPT models found".to_string()))
            }
            GptSovitsPackageFileType::SovitsCheckpoint => {
              Err(GptSovitsPackageError::InvalidSovitsCheckpoint("Multiple Sovits checkpoints found".to_string()))
            }
            GptSovitsPackageFileType::ReferenceAudio => {
              Err(GptSovitsPackageError::InvalidReferenceAudio("Multiple reference audio files found".to_string()))
            }
            GptSovitsPackageFileType::ReferenceTranscript => {
              Err(GptSovitsPackageError::InvalidReferenceTranscript("Multiple reference transcript files found".to_string()))
            }
          }
        }
        info!("Adding file with name {} extension: {}", enclosed_name.display(), extension);
        entries.push(PackageZipEntryDetails {
          enclosed_name: enclosed_name.to_path_buf(),
          maybe_better_alternative_output_name: package_type.package_identifier().to_string(),
          file_size: file.size(),
          is_valid_file_extension: package_type.extension_is_allowed(extension),
          package_type,
        });
      }
    }
  }

  // Only the model files are truly essential
  let has_no_gpt = entries.iter()
      .find(|entry| entry.package_type == GptSovitsPackageFileType::GptModel)
      .is_none();

  let has_no_sovits = entries.iter()
      .find(|entry| entry.package_type == GptSovitsPackageFileType::SovitsCheckpoint)
      .is_none();

  if has_no_gpt || has_no_sovits {
    return Err(GptSovitsPackageError::InvalidArchive);
  }

  for entry in entries.iter() {
    info!("Entry: {:?}", entry);
  }

  Ok(entries)
}

#[cfg(test)]
mod tests {
  use std::fs::File;
  use std::io::BufReader;

  use zip::ZipArchive;

  use testing::test_file_path::test_file_path;

  use crate::job::job_types::gpt_sovits::model_package::model_package::{GptSovitsPackageError, GptSovitsPackageFileType};
  use crate::job::job_types::gpt_sovits::upload_model::extract_and_upload_gpt_sovits_package::{get_relevant_zip_entries, PackageZipEntryDetails};

  fn read_archive(path: &str) -> ZipArchive<BufReader<File>> {
    let path = test_file_path(path).unwrap();
    let file = File::open(path).unwrap();
    let reader = BufReader::new(file);
    ZipArchive::new(reader).unwrap()
  }

  #[test]
  fn test_empty_archive() {
    let mut archive = read_archive("test_data/archive/zip/empty.zip");
    let result = get_relevant_zip_entries(&mut archive);
    assert!(result.is_err());
    assert_eq!(result.err().unwrap(), GptSovitsPackageError::InvalidArchive);
  }

  #[test]
  fn test_archive_with_just_model() {
    let mut archive = read_archive("test_data/archive/zip/gptsovits/just_model.zip");
    let result = get_relevant_zip_entries(&mut archive);

    assert!(result.is_ok());

    let result = result.unwrap();
    assert_eq!(result.len(), 2);

    let entry = result.iter().find(|entry| entry.package_type == GptSovitsPackageFileType::GptModel).unwrap();
    assert_eq!(entry.enclosed_name.to_str().unwrap(), "just_model/gpt.ckpt");

    let entry = result.iter().find(|entry| entry.package_type == GptSovitsPackageFileType::SovitsCheckpoint).unwrap();
    assert_eq!(entry.enclosed_name.to_str().unwrap(), "just_model/sovits.pth");
  }

  #[test]
  fn test_archive_with_single_files() {
    let mut archive = read_archive("test_data/archive/zip/gptsovits/all_files.zip");
    let result = get_relevant_zip_entries(&mut archive);

    assert!(result.is_ok());

    let result = result.unwrap();
    assert_eq!(result.len(), 4);

    let entry = result.iter().find(|entry| entry.package_type == GptSovitsPackageFileType::GptModel).unwrap();
    assert_eq!(entry.enclosed_name.to_str().unwrap(), "all_files/gpt.ckpt");

    let entry = result.iter().find(|entry| entry.package_type == GptSovitsPackageFileType::SovitsCheckpoint).unwrap();
    assert_eq!(entry.enclosed_name.to_str().unwrap(), "all_files/sovits.pth");

    let entry = result.iter().find(|entry| entry.package_type == GptSovitsPackageFileType::ReferenceAudio).unwrap();
    assert_eq!(entry.enclosed_name.to_str().unwrap(), "all_files/reference.wav");

    let entry = result.iter().find(|entry| entry.package_type == GptSovitsPackageFileType::ReferenceTranscript).unwrap();
    assert_eq!(entry.enclosed_name.to_str().unwrap(), "all_files/reference.txt");
  }
}