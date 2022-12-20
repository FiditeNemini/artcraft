/// Visibility
///
/// Used in various database tables (as enums! careful!) and the HTTP API to convey
/// how the associated entity should be made visible to the public.
///
/// To use this in a query, the query must have type annotations.
/// See: https://www.gitmemory.com/issue/launchbadge/sqlx/1241/847154375
/// eg. preferred_tts_result_visibility as `preferred_tts_result_visibility: enums::core::visibility::Visibility`
///
/// See also: https://docs.rs/sqlx/0.4.0-beta.1/sqlx/trait.Type.html
///
/// *DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY!*
///
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum Visibility {
  /// Public entities are able to be listed in public lists.
  /// It does not mean that they necessarily will be (eg. they could be "mod unapproved" or deleted).
  Public,
  /// Hidden entities are not shown in public lists, but the URL to them may be given out freely.
  /// They are available to non-logged-in users as long as they have the URL.
  Hidden,
  /// Private entities should only be available to the creator, a list of approved users, and
  /// website moderation staff.
  Private,

  // TODO(bt, 2022-12-20): We need a "Shared" option where users can share it with a specified group.
  //  This should perhaps be its own type, eg. VisibilityV2., so that we don't use it in tables that
  //  have not yet been migrated to this scheme.
}

impl Default for Visibility {
  fn default() -> Self { Self::Public }
}

/// NB: Legacy API for older code.
impl Visibility {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Public => "public",
      Self::Hidden => "hidden",
      Self::Private => "private",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "public" => Ok(Self::Public),
      "hidden" => Ok(Self::Hidden),
      "private" => Ok(Self::Private),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::core::visibility::Visibility;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_default() {
    assert_eq!(Visibility::default(), Visibility::Public);

  }

  #[test]
  fn test_serialization() {
    assert_serialization(Visibility::Public, "public");
    assert_serialization(Visibility::Hidden, "hidden");
    assert_serialization(Visibility::Private, "private");
  }

  #[test]
  fn test_to_str() {
    assert_eq!(Visibility::Public.to_str(), "public");
    assert_eq!(Visibility::Hidden.to_str(), "hidden");
    assert_eq!(Visibility::Private.to_str(), "private");
  }

  #[test]
  fn test_from_str() {
    assert_eq!(Visibility::from_str("public").unwrap(), Visibility::Public);
    assert_eq!(Visibility::from_str("hidden").unwrap(), Visibility::Hidden);
    assert_eq!(Visibility::from_str("private").unwrap(), Visibility::Private);
    assert!(Visibility::from_str("foo").is_err());
  }
}
