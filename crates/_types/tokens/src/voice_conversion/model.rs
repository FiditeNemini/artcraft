use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for "generic" inference jobs.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct VoiceConversionModelToken(String);

impl_string_token!(VoiceConversionModelToken);
impl_crockford_generator!(VoiceConversionModelToken, 16usize, EntityType::VoiceConversionModel, CrockfordLower);
