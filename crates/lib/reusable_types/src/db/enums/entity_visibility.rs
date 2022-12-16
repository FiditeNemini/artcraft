/// Used in various database tables (as enums! careful!) and the HTTP API to convey
/// how the associated entity should be made visible to the public.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[derive(Clone, Copy, Eq, PartialEq, Debug, Deserialize, Serialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum EntityVisibility {
  /// Public entities are able to be listed in public lists.
  /// It does not mean that they necessarily will be (eg. they could be "mod unapproved" or deleted).
  Public,
  /// Hidden entities are not shown in public lists, but the URL to them may be given out freely.
  /// They are available to non-logged-in users as long as they have the URL.
  Hidden,
  /// Private entities should only be available to the creator, a list of approved users, and
  /// website moderation staff.
  Private,
}

/// NB: Legacy API for older code.
impl EntityVisibility {
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
  use crate::db::enums::entity_visibility::EntityVisibility;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(EntityVisibility::Public, "public");
    assert_serialization(EntityVisibility::Hidden, "hidden");
    assert_serialization(EntityVisibility::Private, "private");
  }

  #[test]
  fn test_to_str() {
    assert_eq!(EntityVisibility::Public.to_str(), "public");
    assert_eq!(EntityVisibility::Hidden.to_str(), "hidden");
    assert_eq!(EntityVisibility::Private.to_str(), "private");
  }

  #[test]
  fn test_from_str() {
    assert_eq!(EntityVisibility::from_str("public").unwrap(), EntityVisibility::Public);
    assert_eq!(EntityVisibility::from_str("hidden").unwrap(), EntityVisibility::Hidden);
    assert_eq!(EntityVisibility::from_str("private").unwrap(), EntityVisibility::Private);
    assert!(EntityVisibility::from_str("foo").is_err());
  }
}
