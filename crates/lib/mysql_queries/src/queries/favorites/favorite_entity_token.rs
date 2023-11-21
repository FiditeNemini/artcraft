use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::tts_results::TtsResultToken;
use tokens::tokens::users::UserToken;
use tokens::tokens::voice_conversion_models::VoiceConversionModelToken;
use tokens::tokens::w2l_results::W2lResultToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::tokens::zs_voices::ZsVoiceToken;

pub enum FavoriteEntityToken {
  User(UserToken),
  TtsModel(TtsModelToken),
  TtsResult(TtsResultToken),
  W2lTemplate(W2lTemplateToken),
  W2lResult(W2lResultToken),
  MediaFile(MediaFileToken),
  VoiceConversionModel(VoiceConversionModelToken),
  ZsVoice(ZsVoiceToken),
}

impl FavoriteEntityToken {
  pub fn from_entity_type_and_token(entity_type: FavoriteEntityType, token: &str) -> Self {
    match entity_type {
      FavoriteEntityType::User => Self::User(UserToken::new_from_str(token)),
      FavoriteEntityType::TtsModel => Self::TtsModel(TtsModelToken::new_from_str(token)),
      FavoriteEntityType::TtsResult => Self::TtsResult(TtsResultToken::new_from_str(token)),
      FavoriteEntityType::W2lTemplate => Self::W2lTemplate(W2lTemplateToken::new_from_str(token)),
      FavoriteEntityType::W2lResult => Self::W2lResult(W2lResultToken::new_from_str(token)),
      FavoriteEntityType::MediaFile => Self::MediaFile(MediaFileToken::new_from_str(token)),
      FavoriteEntityType::VoiceConversionModel => Self::VoiceConversionModel(VoiceConversionModelToken::new_from_str(token)),
      FavoriteEntityType::ZsVoice => Self::ZsVoice(ZsVoiceToken::new_from_str(token)),
    }
  }

  pub fn get_composite_keys(&self) -> (FavoriteEntityType, &str) {
    match self {
      FavoriteEntityToken::User(user_token) => (FavoriteEntityType::User, user_token.as_str()),
      FavoriteEntityToken::TtsModel(tts_model_token) => (FavoriteEntityType::TtsModel, tts_model_token.as_str()),
      FavoriteEntityToken::TtsResult(tts_result_token) => (FavoriteEntityType::TtsResult, tts_result_token.as_str()),
      FavoriteEntityToken::W2lTemplate(w2l_template_token) => (FavoriteEntityType::W2lTemplate, w2l_template_token.as_str()),
      FavoriteEntityToken::W2lResult(w2l_result_token) => (FavoriteEntityType::W2lResult, w2l_result_token.as_str()),
      FavoriteEntityToken::MediaFile(media_file_token) => (FavoriteEntityType::MediaFile, media_file_token.as_str()),
      FavoriteEntityToken::VoiceConversionModel(voice_conversion_model_token) => (FavoriteEntityType::VoiceConversionModel, voice_conversion_model_token.as_str()),
      FavoriteEntityToken::ZsVoice(zs_voice_token) => (FavoriteEntityType::ZsVoice, zs_voice_token.as_str()),
    }
  }
}
