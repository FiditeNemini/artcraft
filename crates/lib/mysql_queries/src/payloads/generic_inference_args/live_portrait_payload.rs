use enums::common::visibility::Visibility;
use tokens::tokens::media_files::MediaFileToken;

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct LivePortraitPayload {
  /// Either an image or video.
  #[serde(rename = "p")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub portrait_media_file_token: Option<MediaFileToken>,

  /// A video that drives the face animation.
  #[serde(rename = "d")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub driver_media_file_token: Option<MediaFileToken>,

  #[serde(rename = "rm")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub remove_watermark: Option<bool>,

  /// This is a debugging flag.
  #[serde(rename = "sp")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub sleep_millis: Option<u64>,
}
