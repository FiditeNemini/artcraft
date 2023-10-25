use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// primary key token for the `twitch_event_rules` table (this is deprecated)
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct TwitchEventRuleToken(pub String);

impl_string_token!(TwitchEventRuleToken);
impl_crockford_generator!(TwitchEventRuleToken, 32usize, EntityType::TwitchEventRule, CrockfordLower);
