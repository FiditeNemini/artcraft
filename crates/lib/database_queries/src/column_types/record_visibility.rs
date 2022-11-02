//! These are columns where users can control the visibility of their data.

use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;

/// To use this in a query, the query must have type annotations.
/// See: https://www.gitmemory.com/issue/launchbadge/sqlx/1241/847154375
/// eg. preferred_tts_result_visibility as `preferred_tts_result_visibility: crate::column_types::record_visibility::RecordVisibility`
#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum RecordVisibility {
  Public,
  Hidden,
  Private,
}

impl Default for RecordVisibility {
  fn default() -> Self { Self::Public }
}

impl RecordVisibility {
  pub fn to_str(&self) -> &'static str {
    match self {
      RecordVisibility::Public => "public",
      RecordVisibility::Hidden => "hidden",
      RecordVisibility::Private => "private",
    }
  }

  pub fn from_str(record_visibility: &str) -> AnyhowResult<Self> {
    match record_visibility {
      "public" => Ok(RecordVisibility::Public),
      "hidden" => Ok(RecordVisibility::Hidden),
      "private" => Ok(RecordVisibility::Private),
      _ => Err(anyhow!("invalid value: {:?}", record_visibility)),
    }
  }
}
