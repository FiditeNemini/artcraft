use tokens::tokens::{model_weights::ModelWeightToken, media_files::MediaFileToken};

/// Video sources can be one of several:
///  - F: media_files (todo)
///  - U: media_uploads (legacy)

/// For image to image we probably want images
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum SDSource {
    // NB: DO NOT CHANGE. It could break live jobs. Renamed to be fewer bytes.
    /// Media File Token (media_files table)
    /// Serde cannot yet rename enum variants.
    F(String),

    // NB: DO NOT CHANGE. It could break live jobs. Renamed to be fewer bytes.
    /// Media Upload Token (media_uploads table)
    /// Serde cannot yet rename enum variants.
    U(String),
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct SDArgs {
    #[serde(rename = "vs")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_video_source: Option<MediaFileToken>,

    #[serde(rename = "is")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_image_source: Option<MediaFileToken>, 

    #[serde(rename = "sd")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_sd_model_token: Option<ModelWeightToken>,

    #[serde(rename = "lm")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_lora_model_token: Option<ModelWeightToken>,

    #[serde(rename = "p")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_prompt: Option<String>,

    #[serde(rename = "ap")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_a_prompt: Option<String>,

    #[serde(rename = "np")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_n_prompt: Option<String>,

    #[serde(rename = "se")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_seed: Option<i32>,
  
    #[serde(rename = "mu")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_upload_path: Option<String>,
    
    #[serde(rename = "lu")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_lora_upload_path: Option<String>

    #[serde(rename = "t")]
    pub inference_type: Option<String>
}


