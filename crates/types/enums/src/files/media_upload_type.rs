use serde::Deserialize;
use serde::Serialize;
use sqlx::Decode;
use sqlx::Encode;
use sqlx::Type;
use sqlx_core::database::HasArguments;
use sqlx_core::encode::IsNull;
use sqlx_core::error::BoxDynError;
use sqlx_core::mysql::{MySql, MySqlTypeInfo, MySqlValueRef};

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// Used in the `media_uploads` table in a `VARCHAR` field.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaUploadType {
  /// Audio files: wav, mp3, etc.
  Audio,
  /// Video files: mp4, etc.
  Video,
}

// This overt approach is being taken because of the following error:
// `MySqlDatabaseError { code: Some("HY000"), number: 1210, message: "Incorrect arguments to mysqld_stmt_execute" }`
// Basically, sqlx can't turn our enum into a VARCHAR when using #[derive(sqlx::Type)].
// We further lose the ability to `#[sqlx(rename_all="lowercase")]`, etc., so our encoder/decoder
// need to set the rules.
// Solution adapted from https://github.com/launchbadge/sqlx/discussions/1502
impl Type<MySql> for MediaUploadType {
  fn type_info() -> MySqlTypeInfo {
    String::type_info()
  }
}

impl<'q> Encode<'q, MySql> for MediaUploadType {
  fn encode_by_ref(&self, buf: &mut <MySql as HasArguments<'q>>::ArgumentBuffer) -> IsNull {
    // NB: In the absence of `#[derive(sqlx::Type)]` and `#sqlx(rename_all="lowercase")]`,
    // this controls the casing of the variants when sent to MySQL.
    self.to_str().encode_by_ref(buf)
  }
}

impl<'r> Decode<'r, MySql> for MediaUploadType {
  fn decode(
    value: MySqlValueRef<'r>,
  ) -> Result<Self, BoxDynError> {
    let string = String::decode(value)?;
    let value = MediaUploadType::from_str(&string)?;
    Ok(value)
  }
}

impl_enum_display_and_debug_for_to_str!(MediaUploadType);

/// NB: Legacy API for older code.
impl MediaUploadType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Audio => "audio",
      Self::Video => "video",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "audio" => Ok(Self::Audio),
      "video" => Ok(Self::Video),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::files::media_upload_type::MediaUploadType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(MediaUploadType::Audio, "audio");
    assert_serialization(MediaUploadType::Video, "video");
  }

  #[test]
  fn test_to_str() {
    assert_eq!(MediaUploadType::Audio.to_str(), "audio");
    assert_eq!(MediaUploadType::Video.to_str(), "video");
  }

  #[test]
  fn test_from_str() {
    assert_eq!(MediaUploadType::from_str("audio").unwrap(), MediaUploadType::Audio);
    assert_eq!(MediaUploadType::from_str("video").unwrap(), MediaUploadType::Video);
    assert!(MediaUploadType::from_str("foo").is_err());
  }
}
