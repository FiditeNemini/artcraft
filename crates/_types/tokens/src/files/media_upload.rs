use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

// FIXME: I think that this file+module structure is an anti-pattern.
//  In the future, we should create two top-level directories: /tokens and /ids, and each token or
//  ID type should be in its own file. (NB: single files cannot share token definitions due to the
//  macro generating test modules that would conflict.)

/// The primary key for user media uploads (images, video, etc.)
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct MediaUploadToken(pub String);

impl_string_token!(MediaUploadToken);
impl_crockford_generator!(MediaUploadToken, 32usize, EntityType::MediaUpload, CrockfordLower);
