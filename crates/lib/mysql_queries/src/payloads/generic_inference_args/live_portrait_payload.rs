use enums::common::visibility::Visibility;
use tokens::tokens::model_weights::ModelWeightToken;

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct LivePortraitPayload {
  /// Either an image or video.
  #[serde(rename = "p")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub portrait_media_file_token: Option<ModelWeightToken>,

  /// A video that drives the face animation.
  #[serde(rename = "d")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub driver_media_file_token: Option<ModelWeightToken>,

  #[serde(rename = "rm")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub remove_watermark: Option<bool>,

  #[serde(rename = "cv")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub creator_visibility: Option<Visibility>,
}
