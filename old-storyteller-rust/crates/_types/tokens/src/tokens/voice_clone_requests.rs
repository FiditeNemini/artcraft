use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::LegacyTokenPrefix;

/// Primary key for the `voice_clone_requests` table.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct VoiceCloneRequestToken(pub String);

impl_string_token!(VoiceCloneRequestToken);
impl_crockford_generator!(VoiceCloneRequestToken, 32usize, LegacyTokenPrefix::VoiceCloneRequest, CrockfordLower);
