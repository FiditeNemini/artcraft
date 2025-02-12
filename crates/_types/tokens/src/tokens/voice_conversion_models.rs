use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::TokenPrefix;

/// The primary key for "generic" inference jobs.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct VoiceConversionModelToken(pub String);

impl_string_token!(VoiceConversionModelToken);
impl_crockford_generator!(VoiceConversionModelToken, 16usize, TokenPrefix::VoiceConversionModel, CrockfordLower);
