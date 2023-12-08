use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::TokenPrefix;

/// The primary key for user weight uploads
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct WeightUploadToken(pub String);

impl_string_token!(WeightUploadToken);
impl_crockford_generator!(WeightUploadToken, 32usize, TokenPrefix::WeightUpload, CrockfordLower);