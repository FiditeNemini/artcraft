use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// The primary key for users.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct UserToken(pub String);

impl_string_token!(UserToken);
impl_crockford_generator!(UserToken, 15usize, EntityType::User, CrockfordUpper);
