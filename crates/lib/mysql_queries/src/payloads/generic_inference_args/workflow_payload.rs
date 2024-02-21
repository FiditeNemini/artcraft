use std::collections::HashMap;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum NewValue {
    String(String),
    Float(f32),
    Int(i32),
    Bool(bool),
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
pub struct WorkflowArgs {
    #[serde(rename = "sd")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_sd_model: Option<ModelWeightToken>,

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

    // google drive link for uploads
    #[serde(rename = "gd")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_google_drive_link: Option<String>
}
