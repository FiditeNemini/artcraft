use serde::Deserialize;
use serde::Serialize;
#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// Used in the `favorites` table in a `VARCHAR(32)` field named `entity_type`.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Deserialize, Serialize)]
pub enum FavoriteEntityType {
    /// User
    #[serde(rename = "user")]
    User,

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

    /// MediaFile
    #[serde(rename = "media_file")]
    MediaFile,

    /// VoiceConversionModel
    #[serde(rename = "voice_conversion_model")]
    VoiceConversionModel,

    /// ZsVoice
    #[serde(rename = "zs_voice")]
    ZsVoice,
}

// TODO(bt, 2023-01-17): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(FavoriteEntityType);
impl_mysql_enum_coders!(FavoriteEntityType);

/// NB: Legacy API for older code.
impl FavoriteEntityType {
    pub fn to_str(&self) -> &'static str {
        match self {
            Self::User => "user",
            Self::TtsModel => "tts_model",
            Self::TtsResult => "tts_result",
            Self::W2lTemplate => "w2l_template",
            Self::W2lResult => "w2l_result",
            Self::MediaFile => "media_file",
            Self::VoiceConversionModel => "voice_conversion_model",
            Self::ZsVoice => "zs_voice",
        }
    }

    pub fn from_str(value: &str) -> Result<Self, String> {
        match value {
            "user" => Ok(Self::User),
            "tts_model" => Ok(Self::TtsModel),
            "tts_result" => Ok(Self::TtsResult),
            "w2l_template" => Ok(Self::W2lTemplate),
            "w2l_result" => Ok(Self::W2lResult),
            "media_file" => Ok(Self::MediaFile),
            "voice_conversion_model" => Ok(Self::VoiceConversionModel),
            "zs_voice" => Ok(Self::ZsVoice),
            _ => Err(format!("invalid value: {:?}", value)),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::by_table::favorites::favorite_entity_type::FavoriteEntityType;
    use crate::test_helpers::assert_serialization;

    mod serde {
        use super::*;

        #[test]
        fn test_serialization() {
            assert_serialization(FavoriteEntityType::User, "user");
            assert_serialization(FavoriteEntityType::TtsModel, "tts_model");
            assert_serialization(FavoriteEntityType::TtsResult, "tts_result");
            assert_serialization(FavoriteEntityType::W2lTemplate, "w2l_template");
            assert_serialization(FavoriteEntityType::W2lResult, "w2l_result");
            assert_serialization(FavoriteEntityType::MediaFile, "media_file");
            assert_serialization(FavoriteEntityType::VoiceConversionModel, "voice_conversion_model");
            assert_serialization(FavoriteEntityType::ZsVoice, "zs_voice");
        }
    }

    mod impl_methods {
        use super::*;

        #[test]
        fn test_to_str() {
            assert_eq!(FavoriteEntityType::User.to_str(), "user");
            assert_eq!(FavoriteEntityType::TtsModel.to_str(), "tts_model");
            assert_eq!(FavoriteEntityType::TtsResult.to_str(), "tts_result");
            assert_eq!(FavoriteEntityType::W2lTemplate.to_str(), "w2l_template");
            assert_eq!(FavoriteEntityType::W2lResult.to_str(), "w2l_result");
            assert_eq!(FavoriteEntityType::MediaFile.to_str(), "media_file");
            assert_eq!(FavoriteEntityType::VoiceConversionModel.to_str(), "voice_conversion_model");
            assert_eq!(FavoriteEntityType::ZsVoice.to_str(), "zs_voice");
        }

        #[test]
        fn test_from_str() {
            assert_eq!(FavoriteEntityType::from_str("user").unwrap(), FavoriteEntityType::User);
            assert_eq!(FavoriteEntityType::from_str("tts_model").unwrap(), FavoriteEntityType::TtsModel);
            assert_eq!(FavoriteEntityType::from_str("tts_result").unwrap(), FavoriteEntityType::TtsResult);
            assert_eq!(FavoriteEntityType::from_str("w2l_template").unwrap(), FavoriteEntityType::W2lTemplate);
            assert_eq!(FavoriteEntityType::from_str("w2l_result").unwrap(), FavoriteEntityType::W2lResult);
            assert_eq!(FavoriteEntityType::from_str("media_file").unwrap(), FavoriteEntityType::MediaFile);
            assert_eq!(FavoriteEntityType::from_str("voice_conversion_model").unwrap(), FavoriteEntityType::VoiceConversionModel);
            assert_eq!(FavoriteEntityType::from_str("zs_voice").unwrap(), FavoriteEntityType::ZsVoice);
            assert!(FavoriteEntityType::from_str("foo").is_err());
        }
    }
}
