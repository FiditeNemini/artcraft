use std::collections::HashMap;
use tokens::tokens::model_weights::ModelWeightToken;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum FileSource {
    F(String),
    U(String),
}

impl FileSource {
    pub fn media_file_token(token: &str) -> Self {
        FileSource::F(token.to_string())
    }
    pub fn media_upload_token(token: &str) -> Self {
        FileSource::U(token.to_string())
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
enum NewValue {
    String(String),
    Float(f32),
    Int(i32),
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct WorkflowArgs {
    #[serde(rename = "sd")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_sd_model: Option<ModelWeightToken>,

    #[serde(rename = "lora")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_lora_model: Option<ModelWeightToken>,

    #[serde(rename = "prompt")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_prompt: Option<String>,

    #[serde(rename = "negative_prompt")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_negative_prompt: Option<String>,

    #[serde(rename = "workflow_config")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_workflow_config: Option<ModelWeightToken>,

    #[serde(rename = "json_modifications")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_json_modifications: Option<HashMap<String, NewValue>>,
}
