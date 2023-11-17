use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::tokens::users::UserToken;

pub enum FavoriteEntityToken {
  User(UserToken),
  TtsModel(TtsModelToken),
  TtsResult(String), // TODO: Strong type
  W2lTemplate(W2lTemplateToken),
  W2lResult(String), // TODO: Strong type
  MediaFile(MediaFileToken),
}

impl FavoriteEntityToken {
  pub fn from_entity_type_and_token(entity_type: FavoriteEntityType, token: &str) -> Self {
    match entity_type {
      FavoriteEntityType::User => Self::User(UserToken::new_from_str(token)),
      FavoriteEntityType::TtsModel => Self::TtsModel(TtsModelToken::new_from_str(token)),
      FavoriteEntityType::TtsResult => Self::TtsResult(token.to_string()),
      FavoriteEntityType::W2lTemplate => Self::W2lTemplate(W2lTemplateToken::new_from_str(token)),
      FavoriteEntityType::W2lResult => Self::W2lResult(token.to_string()),
      FavoriteEntityType::MediaFile => Self::MediaFile(MediaFileToken::new_from_str(token)),
    }
  }

  pub fn get_composite_keys(&self) -> (FavoriteEntityType, &str) {
    let (entity_type, entity_token) = match self {
      FavoriteEntityToken::User(user_token) => (FavoriteEntityType::User, user_token.as_str()),
      FavoriteEntityToken::TtsModel(tts_model_token) => (FavoriteEntityType::TtsModel, tts_model_token.as_str()),
      FavoriteEntityToken::TtsResult(tts_result_token) => (FavoriteEntityType::TtsResult, tts_result_token.as_str()),
      FavoriteEntityToken::W2lTemplate(w2l_template_token) => (FavoriteEntityType::W2lTemplate, w2l_template_token.as_str()),
      FavoriteEntityToken::W2lResult(w2l_result_token) => (FavoriteEntityType::W2lResult, w2l_result_token.as_str()),
      FavoriteEntityToken::MediaFile(media_file_token) => (FavoriteEntityType::MediaFile, media_file_token.as_str()),
    };
    (entity_type, entity_token)
  }
}
