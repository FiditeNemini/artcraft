use serde::Deserialize;
use serde::Serialize;
#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// Used in the `audit_logs` table in a `VARCHAR(32)` field named `entity_type`.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Deserialize, Serialize)]
pub enum AuditLogEntityType {
  /// Comment system
  #[serde(rename = "comment")]
  Comment,

  /// TTS model (architecture does not matter)
  #[serde(rename = "tts_model")]
  TtsModel,

  /// TTS result (architecture does not matter)
  #[serde(rename = "tts_result")]
  TtsResult,

  /// W2L template
  #[serde(rename = "w2l_template")]
  W2lTemplate,

  /// W2L result
  #[serde(rename = "w2l_result")]
  W2lResult,
}

// TODO(bt, 2023-01-17): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(AuditLogEntityType);
impl_mysql_enum_coders!(AuditLogEntityType);

/// NB: Legacy API for older code.
impl AuditLogEntityType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Comment => "comment",
      Self::TtsModel => "tts_model",
      Self::TtsResult => "tts_result",
      Self::W2lTemplate => "w2l_template",
      Self::W2lResult => "w2l_result",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "comment" => Ok(Self::Comment),
      "tts_model" => Ok(Self::TtsModel),
      "tts_result" => Ok(Self::TtsResult),
      "w2l_template" => Ok(Self::W2lTemplate),
      "w2l_result" => Ok(Self::W2lResult),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::audit_logs::audit_log_entity_type::AuditLogEntityType;
  use crate::test_helpers::assert_serialization;

  mod serde {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(AuditLogEntityType::Comment, "comment");
      assert_serialization(AuditLogEntityType::TtsModel, "tts_model");
      assert_serialization(AuditLogEntityType::TtsResult, "tts_result");
      assert_serialization(AuditLogEntityType::W2lTemplate, "w2l_template");
      assert_serialization(AuditLogEntityType::W2lResult, "w2l_result");
    }
  }

  mod impl_methods {
    use super::*;

    #[test]
    fn test_to_str() {
      assert_eq!(AuditLogEntityType::Comment.to_str(), "comment");
      assert_eq!(AuditLogEntityType::TtsModel.to_str(), "tts_model");
      assert_eq!(AuditLogEntityType::TtsResult.to_str(), "tts_result");
      assert_eq!(AuditLogEntityType::W2lTemplate.to_str(), "w2l_template");
      assert_eq!(AuditLogEntityType::W2lResult.to_str(), "w2l_result");
    }

    #[test]
    fn test_from_str() {
      assert_eq!(AuditLogEntityType::from_str("comment").unwrap(), AuditLogEntityType::Comment);
      assert_eq!(AuditLogEntityType::from_str("tts_model").unwrap(), AuditLogEntityType::TtsModel);
      assert_eq!(AuditLogEntityType::from_str("tts_result").unwrap(), AuditLogEntityType::TtsResult);
      assert_eq!(AuditLogEntityType::from_str("w2l_template").unwrap(), AuditLogEntityType::W2lTemplate);
      assert_eq!(AuditLogEntityType::from_str("w2l_result").unwrap(), AuditLogEntityType::W2lResult);
      assert!(AuditLogEntityType::from_str("foo").is_err());
    }
  }
}
