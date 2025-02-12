use tokens::tokens::media_files::MediaFileToken;
use utoipa::ToSchema;

/// Details about submitted lipsync jobs (request arguments only)
#[derive(Serialize, ToSchema)]
pub struct JobDetailsLipsyncRequest {
  /// Media file token for the source audio.
  /// This is probably an audio file, but in the future we might pull audio from video.
  pub audio_source_token: MediaFileToken,

  /// Media file token for the source visuals.
  /// This is either an image or video.
  pub image_or_video_source_token: MediaFileToken,
}
