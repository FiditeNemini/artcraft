use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for model categories.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct ModelCategoryToken(pub String);

impl_string_token!(ModelCategoryToken);
impl_crockford_generator!(ModelCategoryToken, 15usize, EntityType::ModelCategory, CrockfordLower);
