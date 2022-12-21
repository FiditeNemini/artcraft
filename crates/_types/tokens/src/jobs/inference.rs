use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for "generic" inference jobs.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct InferenceJobToken(String);

impl_string_token!(InferenceJobToken);
impl_crockford_generator!(InferenceJobToken, 32usize, EntityType::InferenceJob, CrockfordLower);
