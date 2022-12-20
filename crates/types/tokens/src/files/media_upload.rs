use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for user media uploads (images, video, etc.)
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct MediaUploadToken(String);

impl_string_token!(MediaUploadToken);
impl_crockford_generator!(MediaUploadToken, 32usize, EntityType::DownloadJob, CrockfordLower);
