use chrono::Duration;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;
use errors::AnyhowResult;

use crate::payloads::prompt_args::encoded_style_transfer_name::EncodedStyleTransferName;

// TODO(bt,2024-04-13): Once this gets big enough, design a PromptInnerPayloadBuilder that returns None if no fields were set.

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

  #[serde(rename = "st")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "strength")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub strength: Option<f32>,

  #[serde(rename = "d")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "inference_duration")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub inference_duration_millis: Option<u64>,

  #[serde(rename = "wip")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "main_ipa_workflow")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub main_ipa_workflow: Option<String>,

  #[serde(rename = "wfd")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "face_detailer_workflow")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub face_detailer_workflow: Option<String>,

  #[serde(rename = "wu")] // NB: DO NOT CHANGE: IT WILL BREAK MYSQL RECORDS. Renamed to consume fewer bytes.
  #[serde(alias = "upscaler_workflow")]
  #[serde(skip_serializing_if = "Option::is_none")]
  pub upscaler_workflow: Option<String>,
}

pub struct PromptInnerPayloadBuilder {
  pub style_name: Option<EncodedStyleTransferName>,
  pub used_face_detailer: Option<bool>,
  pub used_upscaler: Option<bool>,
  pub strength: Option<f32>,
  pub inference_duration: Option<Duration>,
  pub main_ipa_workflow: Option<String>,
  pub face_detailer_workflow: Option<String>,
  pub upscaler_workflow: Option<String>,
}

impl PromptInnerPayloadBuilder {
  pub fn new() -> Self {
    Self {
      style_name: None,
      used_face_detailer: None,
      used_upscaler: None,
      strength: None,
      inference_duration: None,
      main_ipa_workflow: None,
      face_detailer_workflow: None,
      upscaler_workflow: None,
    }
  }

  pub fn build(self) -> Option<PromptInnerPayload> {
    if self.style_name.is_none()
        && self.used_face_detailer.is_none()
        && self.used_upscaler.is_none()
        && self.strength.is_none()
        && self.inference_duration.is_none()
        && self.main_ipa_workflow.is_none()
        && self.face_detailer_workflow.is_none()
        && self.upscaler_workflow.is_none()
    {
      return None;
    }

    Some(PromptInnerPayload {
      style_name: self.style_name,
      used_face_detailer: self.used_face_detailer,
      used_upscaler: self.used_upscaler,
      strength: self.strength,
      inference_duration_millis: self.inference_duration
          .map(|duration| duration.num_milliseconds()
              .max(0)
              .unsigned_abs()), // NB: Why does chrono return i64 ? That's crazy!
      main_ipa_workflow: self.main_ipa_workflow,
      face_detailer_workflow: self.face_detailer_workflow,
      upscaler_workflow: self.upscaler_workflow,
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

  pub fn set_strength(&mut self, strength: Option<f32>) {
      self.strength = strength;
  }

  pub fn set_inference_duration(&mut self, duration: Option<Duration>) {
    self.inference_duration = duration;
  }

  pub fn set_main_ipa_workflow(&mut self, workflow: Option<String>) {
    self.main_ipa_workflow = workflow;
  }

  pub fn set_face_detailer_workflow(&mut self, workflow: Option<String>) {
    self.face_detailer_workflow = workflow;
  }

  pub fn set_upscaler_workflow(&mut self, workflow: Option<String>) {
    self.upscaler_workflow = workflow;
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

