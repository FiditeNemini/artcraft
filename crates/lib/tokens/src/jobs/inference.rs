use crate::prefixes::EntityType;

pub struct InferenceToken(String);

impl_string_token!(InferenceToken);
impl_crockford_generator!(InferenceToken, 32usize, EntityType::InferenceJob, CrockfordLower);
