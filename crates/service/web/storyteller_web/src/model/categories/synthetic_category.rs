use tokens::tokens::model_categories::ModelCategoryToken;

#[derive(Clone, Eq, PartialEq, Hash, Debug)]
pub struct SyntheticCategory {
  /// A synthetic model category token that does not exist in the database.
  pub category_token: &'static str,
  pub maybe_super_category_token: Option<&'static str>,

  pub name: &'static str,
  pub name_for_dropdown: &'static str,

  pub model_type: &'static str,

  pub can_directly_have_models: bool,
  pub can_directly_have_subcategories: bool,
}
