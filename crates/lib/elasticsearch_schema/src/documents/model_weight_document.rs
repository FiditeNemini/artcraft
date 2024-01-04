use std::path::PathBuf;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;

use enums::common::visibility::Visibility;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::users::UserToken;

use crate::traits::document::Document;

/// The current name for the index.
/// We may need to perform migrations in the future
pub const MODEL_WEIGHT_INDEX: &str = "model_weights_v1";

#[derive(Serialize, Deserialize, Debug)]
pub struct ModelWeightDocument {
  pub token: ModelWeightToken,

  pub creator_set_visibility: Visibility,

  pub weights_type: WeightsType,
  pub weights_category: WeightsCategory,

  pub title: String,

  pub maybe_cover_image_media_file_token: Option<MediaFileToken>,
  pub maybe_cover_image_media_bucket_path: Option<String>,

  //pub description_markdown: String,
  //pub description_markdown_html: String,

  // TODO(bt,2023-12-22): Populate these fields
  //pub cached_user_ratings_total_count: u32,
  //pub cached_user_ratings_positive_count: u32,
  //pub cached_user_ratings_negative_count: u32,
  //pub cached_user_ratings_ratio: f32,
  //pub cached_user_ratings_last_updated_at: DateTime<Utc>,

  pub creator_user_token: UserToken,
  pub creator_username: String,
  pub creator_display_name: String,
  pub creator_gravatar_hash: String,

  // Fields only used for TTS models and voice conversion models.
  pub maybe_ietf_language_tag: Option<String>,
  pub maybe_ietf_primary_language_subtag: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

impl Document for ModelWeightDocument {
  fn get_document_id(&self) -> String {
    self.token.to_string()
  }

  fn get_document_path(&self) -> PathBuf {
    let document_id = self.get_document_id();
    PathBuf::from(format!("/{MODEL_WEIGHT_INDEX}/_doc/{document_id}"))
  }
}
