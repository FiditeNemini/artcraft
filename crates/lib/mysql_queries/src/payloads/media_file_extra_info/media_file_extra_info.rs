use errors::AnyhowResult;
use crate::payloads::media_file_extra_info::inner_payloads::live_portrait_video_extra_info::LivePortraitVideoExtraInfo;

/// For things that don't fit in the schema
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum MediaFileExtraInfo {
  /// Live Portrait Video
  /// NB: Enum variant is short to conserve DB space.
  /// NB: DO NOT CHANGE. It could break live jobs.
  L(LivePortraitVideoExtraInfo),
}

impl MediaFileExtraInfo {
  pub fn from_str(value: &str) -> AnyhowResult<Self> {
    Ok(serde_json::from_str(value)?)
  }

  pub fn to_string(&self) -> AnyhowResult<String> {
    Ok(serde_json::to_string(self)?)
  }
}
