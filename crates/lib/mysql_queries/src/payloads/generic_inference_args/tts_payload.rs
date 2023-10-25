#[derive(Clone, Debug, Serialize, Deserialize)]

pub struct TTSArgs {
  #[serde(rename = "vt")] 
  pub voice_token: Option<String>, //  varchar 32
  #[serde(rename = "dt")] 
  pub dataset_token: Option<String>
}
