use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::TokenPrefix;
use utoipa::ToSchema;

/// The primary key for "generic" inference jobs.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize, Default, ToSchema)]
#[sqlx(transparent)]
pub struct InferenceJobToken(String);

impl_crockford_generator!(InferenceJobToken, 32usize, TokenPrefix::InferenceJob, CrockfordLower);
impl_mysql_token_from_row!(InferenceJobToken);
impl_string_token!(InferenceJobToken);
