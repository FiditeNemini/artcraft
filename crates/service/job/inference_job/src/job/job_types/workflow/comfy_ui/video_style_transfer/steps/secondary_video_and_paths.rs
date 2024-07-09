use std::path::PathBuf;
use mysql_queries::queries::media_files::get::batch_get_media_files_by_tokens::MediaFilesByTokensRecord;
use mysql_queries::queries::media_files::get::get_media_file::MediaFile;

/// This is for the secondary depth, normal, and outline videos.
/// We attach metadata as these videos progress through the system (if they're present).
pub struct SecondaryVideoAndPaths {
  //pub media_file: MediaFile,
  pub media_file: MediaFilesByTokensRecord,
  pub original_download_path: PathBuf,
  pub maybe_processed_path: Option<PathBuf>,
}
