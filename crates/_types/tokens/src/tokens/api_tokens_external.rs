use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// External-facing key for the `api_tokens` table.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct ApiTokenExternal(pub String);

impl_string_token!(ApiTokenExternal);
impl_crockford_generator!(ApiTokenExternal, 32usize, EntityType::ApiTokenExternal, CrockfordUpper);
