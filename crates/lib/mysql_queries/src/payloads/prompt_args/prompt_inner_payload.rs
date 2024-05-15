use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use errors::AnyhowResult;

use crate::payloads::prompt_args::encoded_style_transfer_name::EncodedStyleTransferName;

// TODO(bt,2024-04-13): Once this gets big enough, design a PromptInnerPayloadBuilder that returns None if no fields were set.

pub struct PromptInnerPayloadBuilder {
  pub style_name: Option<EncodedStyleTransferName>,
  pub used_face_detailer: Option<bool>,
  pub used_upscaler: Option<bool>,
}

/// Used to encode extra state for the `prompts` table in the `maybe_other_args` column.
/// This should act somewhat like a serialized protobuf stored inside a record.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PromptInnerPayload {
  // This stores the
  #[serde(rename = "sn")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "style_name")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub style_name: Option<EncodedStyleTransferName>,

  #[serde(rename = "fd")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "face_detailer")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub used_face_detailer: Option<bool>,

  #[serde(rename = "up")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "used_upscaler")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub used_upscaler: Option<bool>,
}

impl PromptInnerPayloadBuilder {
  pub fn new() -> Self {
    Self {
      style_name: None,
      used_face_detailer: None,
      used_upscaler: None,
    }
  }

  pub fn build(self) -> Option<PromptInnerPayload> {
    if self.style_name.is_none()
        && self.used_face_detailer.is_none()
        && self.used_upscaler.is_none() {
      return None;
    }

    Some(PromptInnerPayload {
      style_name: self.style_name,
      used_face_detailer: self.used_face_detailer,
      used_upscaler: self.used_upscaler,
    })
  }

  pub fn set_style_name(&mut self, name: StyleTransferName) {
    self.style_name = Some(EncodedStyleTransferName::from_style_name(name));
  }

  pub fn set_used_face_detailer(&mut self, used: bool) {
    if used {
      self.used_face_detailer = Some(true);
    } else {
      self.used_face_detailer = None;
    }
  }

  pub fn set_used_upscaler(&mut self, used: bool) {
    if used {
      self.used_upscaler = Some(true);
    } else {
      self.used_upscaler = None;
    }
  }
}

impl PromptInnerPayload{
  pub fn from_json(json: &str) -> AnyhowResult<Self> {
    Ok(serde_json::from_str(json)?)
  }

  pub fn to_json(&self) -> AnyhowResult<String> {
    Ok(serde_json::to_string(self)?)
  }
}

