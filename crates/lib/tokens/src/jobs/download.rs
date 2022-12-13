use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for "generic" inference jobs.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct DownloadJobToken(String);

impl_string_token!(DownloadJobToken);
impl_crockford_generator!(DownloadJobToken, 32usize, EntityType::DownloadJob, CrockfordLower);
