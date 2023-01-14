use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for W2L templates.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct W2lTemplateToken(pub String);

impl_string_token!(W2lTemplateToken);
impl_crockford_generator!(W2lTemplateToken, 32usize, EntityType::W2lTemplate, CrockfordLower);
