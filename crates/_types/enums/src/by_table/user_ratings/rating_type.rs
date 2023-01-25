#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// UserRatingType
///
/// - Used in the `user_ratings` table as an `ENUM` field named `rating_type`.
/// - Used in the HTTP API.
///
/// To use this in a query, the query must have type annotations.
/// See: https://www.gitmemory.com/issue/launchbadge/sqlx/1241/847154375
/// eg. preferred_tts_result_visibility as `rating_type: enums::by_table::user_ratings::rating_type::UserRatingType`
///
/// See also: https://docs.rs/sqlx/0.4.0-beta.1/sqlx/trait.Type.html
///
/// *DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY!*
///
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Deserialize, Serialize, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum UserRatingType {
  /// This is considered a ratings "soft deletion" and does not count towards a total score.
  /// This is the default rating.
  Neutral,
  /// This is a positive vote / upvote / like.
  /// They are available to non-logged-in users as long as they have the URL.
  Positive,
  /// This is a negative vote / downvote / dislike.
  Negative,
}


impl_enum_display_and_debug_using_to_str!(UserRatingType);

impl Default for UserRatingType {
  fn default() -> Self { Self::Neutral }
}

/// NB: Legacy API for older code.
impl UserRatingType {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::Neutral => "neutral",
      Self::Positive => "positive",
      Self::Negative => "negative",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "neutral" => Ok(Self::Neutral),
      "positive" => Ok(Self::Positive),
      "negative" => Ok(Self::Negative),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::user_ratings::rating_type::UserRatingType;
  use crate::test_helpers::assert_serialization;

  #[test]
  fn test_serialization() {
    assert_serialization(UserRatingType::Neutral, "neutral");
    assert_serialization(UserRatingType::Positive, "positive");
    assert_serialization(UserRatingType::Negative, "negative");
  }

  mod impl_methods {
    use super::*;

    #[test]
    fn to_str() {
      assert_eq!(UserRatingType::Neutral.to_str(), "neutral");
      assert_eq!(UserRatingType::Positive.to_str(), "positive");
      assert_eq!(UserRatingType::Negative.to_str(), "negative");
    }

    #[test]
    fn from_str() {
      assert_eq!(UserRatingType::from_str("neutral").unwrap(), UserRatingType::Neutral);
      assert_eq!(UserRatingType::from_str("positive").unwrap(), UserRatingType::Positive);
      assert_eq!(UserRatingType::from_str("negative").unwrap(), UserRatingType::Negative);
      assert!(UserRatingType::from_str("foo").is_err());
    }
  }

  mod traits {
    use super::*;

    #[test]
    fn default() {
      assert_eq!(UserRatingType::default(), UserRatingType::Neutral);
    }

    #[test]
    fn display() {
      let visibility = UserRatingType::Positive;
      assert_eq!(format!("{}", visibility), "positive".to_string());
    }

    #[test]
    fn debug() {
      let visibility = UserRatingType::Negative;
      assert_eq!(format!("{:?}", visibility), "negative".to_string());
    }
  }

  #[derive(Serialize, Deserialize, PartialEq, Debug)]
  struct CompositeType {
    visibility: UserRatingType,
    string: String,
  }

  mod serde_serialization {
    use super::*;

    #[test]
    fn serialize() {
      let expected = "\"positive\"".to_string(); // NB: Quoted

      assert_eq!(expected, toml::to_string(&UserRatingType::Positive).unwrap());

      // Just to show this serializes the same as a string
      assert_eq!(expected, toml::to_string("positive").unwrap());
    }

    #[test]
    fn nested_serialize() {
      let value = CompositeType { visibility: UserRatingType::Negative, string: "bar".to_string() };
      let expected = r#"{"visibility":"negative","string":"bar"}"#.to_string();
      assert_eq!(expected, serde_json::to_string(&value).unwrap());
    }
  }

  mod serde_deserialization {
    use super::*;

    #[test]
    fn deserialize() {
      let payload = "\"positive\""; // NB: Quoted
      let value: UserRatingType = serde_json::from_str(payload).unwrap();
      assert_eq!(value, UserRatingType::Positive);
    }

    #[test]
    fn nested_deserialize() {
      let payload = r#"{"visibility":"neutral","string":"bar"}"#.to_string();
      let expected = CompositeType {
        visibility: UserRatingType::Neutral,
        string: "bar".to_string(),
      };

      assert_eq!(expected, serde_json::from_str::<CompositeType>(&payload).unwrap());
    }
  }
}
