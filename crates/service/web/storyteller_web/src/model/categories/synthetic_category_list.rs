use chrono::{DateTime, Utc};
use crate::model::categories::synthetic_category::SyntheticCategory;
use enums::by_table::model_categories::model_type::ModelType;
use once_cell::sync::Lazy;
use tokens::tokens::model_categories::ModelCategoryToken;

pub const SYNTHETIC_CATEGORY_LATEST_TTS_MODELS : SyntheticCategory = SyntheticCategory {
  category_token: "SYNTHETIC_CATEGORY:LATEST_MODELS",
  maybe_super_category_token: None,
  name: "Latest Models",
  name_for_dropdown: "Latest Models",
  model_type: ModelType::Tts,
  can_directly_have_models: false,
  can_directly_have_subcategories: false,
};

pub const SYNTHETIC_CATEGORY_TRENDING_TTS_MODELS : SyntheticCategory = SyntheticCategory {
  category_token: "SYNTHETIC_CATEGORY:TRENDING_MODELS",
  maybe_super_category_token: None,
  name: "Trending Models",
  name_for_dropdown: "Trending Models",
  model_type: ModelType::Tts,
  can_directly_have_models: false,
  can_directly_have_subcategories: false,
};

/// List of the system's statically configured synthetic TTS categories
/// These are populated serverside and served to the frontend along with
/// the user-generated/user-populated categories.
pub static SYNTHETIC_CATEGORY_LIST : Lazy<Vec<&'static SyntheticCategory>> =
  Lazy::new(|| {
    Vec::from([
      &SYNTHETIC_CATEGORY_LATEST_TTS_MODELS,
      &SYNTHETIC_CATEGORY_TRENDING_TTS_MODELS,
    ])
  });
