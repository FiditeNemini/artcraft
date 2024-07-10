use std::path::PathBuf;

use anyhow::anyhow;

use mysql_queries::queries::media_files::get::batch_get_media_files_by_tokens::MediaFilesByTokensRecord;
use mysql_queries::queries::media_files::get::get_media_file::MediaFile;
use tokens::tokens::media_files::MediaFileToken;

use crate::job::job_loop::process_single_job_error::ProcessSingleJobError;

/// This is for the secondary depth, normal, and outline videos.
/// We attach metadata as these videos progress through the system (if they're present).
pub struct InputVideoAndPaths {
  pub record: VideoMediaFileRecord,
  pub original_download_path: PathBuf,
  pub maybe_processed_path: Option<PathBuf>,
}

// Adapter enum
pub enum VideoMediaFileRecord {
  // Records returned by single lookup
  Single(MediaFile),
  // Records returned by batch query
  Bulk(MediaFilesByTokensRecord),
}

impl VideoMediaFileRecord {
  pub fn token(&self) -> &MediaFileToken {
    match self {
      VideoMediaFileRecord::Single(m) => &m.token,
      VideoMediaFileRecord::Bulk(m) => &m.token,
    }
  }

  pub fn maybe_title(&self) -> Option<&str> {
    match self {
      VideoMediaFileRecord::Single(m) => m.maybe_title.as_deref(),
      VideoMediaFileRecord::Bulk(m) => m.maybe_title.as_deref(),
    }
  }

  pub fn maybe_style_transfer_source_media_file_token(&self) -> Result<Option<&MediaFileToken>, ProcessSingleJobError> {
    // TODO(bt,2024-07-09): Future proofing this to deliberately explode in case I query the
    //  primary input media files with the bulk query.
    match self {
      VideoMediaFileRecord::Single(m) => Ok(m.maybe_style_transfer_source_media_file_token.as_ref()),
      VideoMediaFileRecord::Bulk(_m) => Err(ProcessSingleJobError::Other(anyhow!("bad refactor?: failed to query foreign key"))),
    }
  }

  pub fn maybe_scene_source_media_file_token(&self) -> Result<Option<&MediaFileToken>, ProcessSingleJobError> {
    // TODO(bt,2024-07-09): Future proofing this to deliberately explode in case I query the
    //  primary input media files with the bulk query.
    match self {
      VideoMediaFileRecord::Single(m) => Ok(m.maybe_scene_source_media_file_token.as_ref()),
      VideoMediaFileRecord::Bulk(_m) => Err(ProcessSingleJobError::Other(anyhow!("bad refactor?: failed to query foreign key"))),
    }
  }
}
