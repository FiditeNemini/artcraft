
pub struct InferenceToken {
  pub value: String,
}

impl InferenceToken {
  pub fn new() -> Self {
    InferenceToken {
      value: "".to_string(),
    }
  }
}