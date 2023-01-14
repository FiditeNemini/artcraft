use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for TTS models.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct TtsModelToken(pub String);

impl_string_token!(TtsModelToken);
impl_crockford_generator!(TtsModelToken, 15usize, EntityType::TtsModel, CrockfordLower);
