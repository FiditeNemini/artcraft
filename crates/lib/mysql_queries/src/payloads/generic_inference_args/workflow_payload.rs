use std::collections::HashMap;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use enums::common::visibility::Visibility;
use enums::no_table::style_transfer::style_transfer_name::StyleTransferName;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NewValue {
    String(String),
    Float(f32),
    Int(i32),
    Bool(bool),
}

impl NewValue {
    pub fn to_string(&self) -> String {
        match self {
            NewValue::String(s) => s.to_string(),
            NewValue::Int(s) => s.to_string(),
            NewValue::Float(s) => s.to_string(),
            NewValue::Bool(s) => s.to_string(),
        }
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct WorkflowArgs {
    #[serde(rename = "lora")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_lora_model: Option<ModelWeightToken>,

    #[serde(rename = "workflow_config")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_workflow_config: Option<ModelWeightToken>,

    #[serde(rename = "json_modifications")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_json_modifications: Option<HashMap<String, NewValue>>,

    #[serde(rename = "in")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_input_file: Option<MediaFileToken>,

    #[serde(rename = "out")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_output_path: Option<String>,

    // Upload information
    // google drive link for uploads
    #[serde(rename = "gd")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_google_drive_link: Option<String>,

    #[serde(rename = "ti")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_title: Option<String>,

    #[serde(rename = "de")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_description: Option<String>,

    #[serde(rename = "ch")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_commit_hash: Option<String>,

    #[serde(rename = "cv")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub creator_visibility: Option<Visibility>,

    #[serde(rename = "ts")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trim_start_seconds: Option<u32>,

    #[serde(rename = "te")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trim_end_seconds: Option<u32>,

    #[serde(rename = "tf")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_fps: Option<u32>,

    //
    // New Style Jobs
    //
    // The following jobs simply communicate a "style name" and high level parameters
    // and rely on the backend to set node parameters:
    //

    #[serde(rename = "sn")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub style_name: Option<StyleTransferName>,

    #[serde(rename = "tsm")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trim_start_milliseconds: Option<u64>,

    #[serde(rename = "tem")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trim_end_milliseconds: Option<u64>,

    #[serde(rename = "pp")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub positive_prompt: Option<String>,

    #[serde(rename = "np")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub negative_prompt: Option<String>,

    #[serde(rename = "el")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_lipsync: Option<bool>,
}
