use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;
use utoipa::ToSchema;

use crate::prefixes::TokenPrefix;

/// The primary key for the  "model_weights" table.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize,ToSchema)]
#[sqlx(transparent)]
pub struct ModelWeightToken(pub String);

impl_crockford_generator!(ModelWeightToken, 32usize, TokenPrefix::ModelWeight, CrockfordLower);
impl_mysql_token_from_row!(ModelWeightToken);
impl_string_token!(ModelWeightToken);
