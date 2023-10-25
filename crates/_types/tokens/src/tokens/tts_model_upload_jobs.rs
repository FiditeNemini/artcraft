use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// Primary key for the `tts_model_upload_jobs` table.
#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct TtsModelUploadJobToken(pub String);

impl_string_token!(TtsModelUploadJobToken);
impl_crockford_generator!(TtsModelUploadJobToken, 32usize, EntityType::TtsModelUploadJob, CrockfordLower);
