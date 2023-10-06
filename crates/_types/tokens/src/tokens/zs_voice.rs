use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct ZsVoiceToken(pub String);

impl_string_token!(ZsVoiceToken);
impl_crockford_generator!(ZsVoiceToken, 32usize, EntityType::ZsVoice, CrockfordLower);
