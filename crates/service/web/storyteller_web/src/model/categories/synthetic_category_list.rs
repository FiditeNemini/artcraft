use tokens::tokens::model_categories::ModelCategoryToken;
use crate::model::categories::synthetic_category::SyntheticCategory;

const CATEGORY_LATEST_TTS_MODELS : SyntheticCategory = SyntheticCategory {
  category_token: "CAT:SYNTHETIC_LATEST_MODELS",
  maybe_super_category_token: None,
  name: "",
  name_for_dropdown: "",
  model_type: "tts",
  can_directly_have_models: false,
  can_directly_have_subcategories: false,
};

const CATEGORY_TRENDING_TTS_MODELS : SyntheticCategory = SyntheticCategory {
  category_token: "CAT:SYNTHETIC_TRENDING_MODELS",
  maybe_super_category_token: None,
  name: "",
  name_for_dropdown: "",
  model_type: "",
  can_directly_have_models: false,
  can_directly_have_subcategories: false,
};
