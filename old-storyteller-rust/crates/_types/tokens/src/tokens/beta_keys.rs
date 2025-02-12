use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;
use utoipa::ToSchema;

use crate::prefixes::TokenPrefix;

/// The primary key for Audit Logs.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize, ToSchema)]
#[sqlx(transparent)]
pub struct BetaKeyToken(pub String);

impl_crockford_generator!(BetaKeyToken, 32usize, TokenPrefix::BetaKey, CrockfordLower);
impl_mysql_token_from_row!(BetaKeyToken);
impl_string_token!(BetaKeyToken);
