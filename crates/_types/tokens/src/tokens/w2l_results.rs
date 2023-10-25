use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// Primary key for the `w2l_results` table.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct W2lResultToken(pub String);

impl_string_token!(W2lResultToken);
impl_crockford_generator!(W2lResultToken, 32usize, EntityType::W2lResult, CrockfordLower);
