use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// "internal token" for the `twitch_oauth_tokens` table (this is deprecated)
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct TwitchOauthInternalToken(pub String);

impl_string_token!(TwitchOauthInternalToken);
impl_crockford_generator!(TwitchOauthInternalToken, 32usize, EntityType::TwitchOauthInternal, CrockfordLower);
