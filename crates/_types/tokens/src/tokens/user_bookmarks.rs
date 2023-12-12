use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;
use crate::prefixes::TokenPrefix;


/// The primary key for Audit Logs.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct UserBookmarkToken(pub String);

impl_string_token!(UserBookmarkToken);
impl_crockford_generator!(UserBookmarkToken, 32usize, TokenPrefix::UserBookmark, CrockfordLower);
