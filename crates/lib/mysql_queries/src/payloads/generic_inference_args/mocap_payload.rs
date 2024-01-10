/// Video sources can be one of several:
///  - F: media_files (todo)
///  - U: media_uploads (legacy)
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub enum MocapVideoSource {
    // NB: DO NOT CHANGE. It could break live jobs. Renamed to be fewer bytes.
    /// Media File Token (media_files table)
    /// Serde cannot yet rename enum variants.
    F(String),

    // NB: DO NOT CHANGE. It could break live jobs. Renamed to be fewer bytes.
    /// Media Upload Token (media_uploads table)
    /// Serde cannot yet rename enum variants.
    U(String),
}


impl MocapVideoSource {
    pub fn media_file_token(token: &str) -> Self {
        MocapVideoSource::F(token.to_string())
    }
    pub fn media_upload_token(token: &str) -> Self {
        MocapVideoSource::U(token.to_string())
    }
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct MocapArgs {
    #[serde(rename = "vs")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_video_source: Option<MocapVideoSource>,
}
