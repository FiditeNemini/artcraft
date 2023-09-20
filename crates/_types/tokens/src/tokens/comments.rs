use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// The primary key for Audit Logs.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct CommentToken(pub String);

impl_string_token!(CommentToken);
impl_crockford_generator!(CommentToken, 32usize, EntityType::Comment, CrockfordLower);
