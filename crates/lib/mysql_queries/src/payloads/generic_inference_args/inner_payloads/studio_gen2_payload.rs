use crate::payloads::generic_inference_args::common::watermark_type::WatermarkType;
use enums::common::visibility::Visibility;
use std::time::Duration;
use tokens::tokens::media_files::MediaFileToken;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct StudioGen2Payload {
  /// The input image media file (required)
  #[serde(rename = "i")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub image_file: Option<MediaFileToken>,

  /// The input video media file (required)
  #[serde(rename = "v")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub video_file: Option<MediaFileToken>,

  #[serde(rename = "wt")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub watermark_type: Option<WatermarkType>,

  #[serde(rename = "cv")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub creator_visibility: Option<Visibility>,

  #[serde(rename = "sm")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub after_job_debug_sleep_millis: Option<u64>,

  #[serde(rename = "ow")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub output_width: Option<u64>,

  #[serde(rename = "oh")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub output_height: Option<u64>,
}
