
pub struct InferenceToken(String);

impl_string_token!(InferenceToken);
impl_crockford_generator!(InferenceToken, 32usize, "infj_", false);
