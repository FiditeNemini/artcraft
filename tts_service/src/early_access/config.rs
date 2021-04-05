
/// Config for a single early access endpoint
#[derive(Deserialize, Debug, Clone)]
pub struct EarlyAccessVoice {
  pub http_endpoint: String,
  pub voices: Vec<String>,
}

/// Mapping of all the voices.
pub struct EarlyAccessVoices {
  pub url_slug_to_voices: HashMap<String, EarlyAccessVoice>

}