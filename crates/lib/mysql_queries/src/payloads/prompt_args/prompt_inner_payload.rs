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
}
