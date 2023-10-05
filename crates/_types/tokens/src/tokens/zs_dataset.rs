use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct ZsDatasetToken(pub String);

impl_string_token!(ZsDatasetToken);
impl_crockford_generator!(ZsDatasetToken, 32usize, EntityType::ZsDataset, CrockfordLower);
