//! These are columns where users can control the visibility of their data.

//#[sqlx(rename_all = "lowercase", rename = "preferred_tts_result_visibility")]

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "lowercase")]
pub enum RecordVisibility {
  #[sqlx(rename = "public")]
  Public,
  #[sqlx(rename = "hidden")]
  Hidden,
  #[sqlx(rename = "private")]
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
