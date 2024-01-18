use chrono::{DateTime, Utc};
use sqlx::MySql;
use sqlx::pool::PoolConnection;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use mysql_queries::queries::model_weights::list::list_model_weights_for_text_to_speech::{list_model_weights_for_text_to_speech, ModelWeightForTts};
use mysql_queries::queries::tts::tts_models::list_tts_models::{list_tts_models_with_connection, TtsModelRecordForList};

/// List TTS models
/// This is for the tts model list page.
/// Since we're listing, we have to use a flag to determine which query to perform.
pub async fn list_tts_models_for_migration(
  mysql_connection: &mut PoolConnection<MySql>,
  use_weights_table: bool,
) -> AnyhowResult<Vec<TtsModelForList>> {
  // NB: This is temporary migration code as we switch from the `tts_models` table to the `model_weights` table.
  if use_weights_table {
    let models = list_model_weights_for_text_to_speech(
      mysql_connection).await?;

    Ok(models.into_iter()
        .map(|model| TtsModelForList::ModelWeight(model))
        .collect())

  } else {
    let models = list_tts_models_with_connection(
      mysql_connection, None, false).await?;

    Ok(models.into_iter()
        .map(|model| TtsModelForList::LegacyTts(model))
        .collect())
  }
}

/// Union over the legacy table and the new table to support an easier migration.
/// This enum can hold a record of either type and present a unified accessor interface.
#[derive(Clone)]
pub enum TtsModelForList {
  /// Old type from the `tts_models` table, on the way out
  LegacyTts(TtsModelRecordForList),
  /// New type, replacing the `tts_models` table.
  ModelWeight(ModelWeightForTts),
}

impl TtsModelForList {
  pub fn token(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => model.model_token.as_str(),
      TtsModelForList::ModelWeight(ref model) => model.token.as_str(),
    }
  }

  pub fn title(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.title,
      TtsModelForList::ModelWeight(ref model) => &model.title,
    }
  }

  pub fn ietf_language_tag(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.ietf_language_tag,
      TtsModelForList::ModelWeight(ref model) => &model.ietf_language_tag,
    }
  }

  pub fn ietf_primary_language_subtag(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.ietf_primary_language_subtag,
      TtsModelForList::ModelWeight(ref model) => &model.ietf_primary_language_subtag,
    }
  }

  pub fn creator_user_token(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.creator_user_token,
      TtsModelForList::ModelWeight(ref model) => model.creator_user_token.as_str(),
    }
  }

  pub fn creator_username(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.creator_username,
      TtsModelForList::ModelWeight(ref model) => &model.creator_username,
    }
  }

  pub fn creator_display_name(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.creator_display_name,
      TtsModelForList::ModelWeight(ref model) => &model.creator_display_name,
    }
  }

  pub fn creator_gravatar_hash(&self) -> &str {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.creator_gravatar_hash,
      TtsModelForList::ModelWeight(ref model) => &model.creator_gravatar_hash,
    }
  }

  pub fn creator_set_visibility(&self) -> Visibility{
    match self {
      TtsModelForList::LegacyTts(ref model) => model.creator_set_visibility,
      TtsModelForList::ModelWeight(ref model) => model.creator_set_visibility,
    }
  }

  pub fn created_at(&self) -> &DateTime<Utc> {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.created_at,
      TtsModelForList::ModelWeight(ref model) => &model.created_at,
    }
  }

  pub fn updated_at(&self) -> &DateTime<Utc> {
    match self {
      TtsModelForList::LegacyTts(ref model) => &model.updated_at,
      TtsModelForList::ModelWeight(ref model) => &model.updated_at,
    }
  }

  // Not supported in the new table
  pub fn is_front_page_featured(&self) -> bool {
    match self {
      TtsModelForList::LegacyTts(ref model) => model.is_front_page_featured,
      TtsModelForList::ModelWeight(ref _model) => false,
    }
  }

  // Not supported in the new table
  pub fn user_ratings_positive_count(&self) -> u32 {
    match self {
      TtsModelForList::LegacyTts(ref model) => model.user_ratings_positive_count,
      TtsModelForList::ModelWeight(ref _model) => 0,
    }
  }

  // Not supported in the new table
  pub fn user_ratings_negative_count(&self) -> u32 {
    match self {
      TtsModelForList::LegacyTts(ref model) => model.user_ratings_negative_count,
      TtsModelForList::ModelWeight(ref _model) => 0,
    }
  }

  // Not supported in the new table
  pub fn user_ratings_total_count(&self) -> u32 {
    match self {
      TtsModelForList::LegacyTts(ref model) => model.user_ratings_total_count,
      TtsModelForList::ModelWeight(ref _model) => 0,
    }
  }
}
