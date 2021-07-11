//! These are columns where users can control the visibility of their data.

/// To use this in a query, the query must have type annotations.
/// See: https://www.gitmemory.com/issue/launchbadge/sqlx/1241/847154375
/// eg. preferred_tts_result_visibility as `preferred_tts_result_visibility: crate::database::enums::record_visibility::RecordVisibility`
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum RecordVisibility {
  Public,
  Hidden,
  Private,
}

impl RecordVisibility {
  pub fn to_str(&self) -> &'static str {
    match self {
      RecordVisibility::Public => "public",
      RecordVisibility::Hidden => "hidden",
      RecordVisibility::Private => "private",
    }
  }
}
