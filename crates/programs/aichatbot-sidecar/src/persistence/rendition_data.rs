
/// For serializing OpenAI GPT requests.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RenditionData {
  /// Location the article came from
  pub original_content_url: String,

  /// The prompt we sent to OpenAI
  pub original_prompt: String,

  /// Response from OpenAI
  pub response: String,
}
