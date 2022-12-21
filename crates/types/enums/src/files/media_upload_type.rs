use sqlx::Type;
use serde::Deserialize;
use serde::Serialize;
use sqlx_core::database::HasArguments;
use sqlx_core::encode::IsNull;
use sqlx_core::mysql::MySql;

/// Used in the `media_uploads` table in a `VARCHAR` field.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
//#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
//#[sqlx(rename_all = "lowercase")]
pub enum MediaUploadType {
  #[serde(rename = "audio")]
  //#[sqlx(rename = "audio")]
  Audio,
  #[serde(rename = "video")]
  //#[sqlx(rename = "video")]
  Video,
}

// Solution adapted from https://github.com/launchbadge/sqlx/discussions/1502
impl Type<sqlx::MySql> for MediaUploadType {
  fn type_info() -> sqlx::mysql::MySqlTypeInfo {
    String::type_info()
  }
}


impl<'q> sqlx::Encode<'q, sqlx::MySql> for MediaUploadType {
  fn encode_by_ref(&self, buf: &mut <MySql as HasArguments<'q>>::ArgumentBuffer) -> IsNull {
    self.to_string().encode_by_ref(buf)
  }
}

impl<'r> sqlx::Decode<'r, sqlx::MySql> for MediaUploadType {
  fn decode(
    value: sqlx::mysql::MySqlValueRef<'r>,
  ) -> Result<Self, sqlx::error::BoxDynError> {
    let string = String::decode(value)?;
    let value = MediaUploadType::from_str(&string)?;
    //let value = string.parse()?;
    Ok(value)
  }
}


impl_string_enum!(MediaUploadType);

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
