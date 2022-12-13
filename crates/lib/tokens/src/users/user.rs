use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

// https://docs.rs/sqlx/latest/sqlx/trait.Type.html
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct UserToken(pub String);

// For reference, here's what the serde implementation might be if manually written.
// This may be useful for designing composite types in the future:
//
//   use serde::{Deserializer, Serializer};
//
//   impl serde::Serialize for UserToken {
//     fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
//       serializer.serialize_str(&self.0)
//     }
//   }
//
//   impl<'de> serde::Deserialize<'de> for UserToken {
//     fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
//       let s = String::deserialize(d)?;
//       Ok(UserToken(s))
//     }
//   }

impl_string_token!(UserToken);
impl_crockford_generator!(UserToken, 15usize, EntityType::User, CrockfordUpper);

#[cfg(test)]
mod tests {
  use crate::users::user::UserToken;
  use serde::Deserialize;
  use serde::Serialize;

  #[derive(Serialize, Deserialize, PartialEq, Debug)]
  struct CompositeType {
    user_token: UserToken,
    string: String,
  }

  #[test]
  fn test_generate() {
    let token = UserToken::generate();
    assert_eq!(token, UserToken("U:foo".to_string()));
  }

  #[test]
  fn test_new() {
    let token = UserToken::new("U:foo".to_string());
    assert_eq!(token, UserToken("U:foo".to_string()));
  }

  #[test]
  fn test_new_from_str() {
    let token = UserToken::new_from_str("U:foo");
    assert_eq!(token, UserToken("U:foo".to_string()));
  }

  #[test]
  fn as_str() {
    let token = UserToken("U:foo".to_string());
    assert_eq!(token.as_str(), "U:foo");
  }

  #[test]
  fn to_string() {
    let token = UserToken("U:foo".to_string());
    assert_eq!(token.to_string(), "U:foo".to_string());
  }

  #[test]
  fn test_display_trait() {
    let token = UserToken("U:foo".to_string());
    assert_eq!(format!("{}", token), "U:foo".to_string());
  }

  #[test]
  fn test_debug_trait() {
    let token = UserToken("U:foo".to_string());
    assert_eq!(format!("{:?}", token), "UserToken(\"U:foo\")".to_string());
  }

  #[test]
  fn test_serialize_trait() {
    let expected = "\"U:foo\"".to_string(); // NB: Quoted

    let token = UserToken("U:foo".to_string());
    assert_eq!(expected, toml::to_string(&token).unwrap());

    // Just to show this serializes the same as a string
    assert_eq!(expected, toml::to_string("U:foo").unwrap());
  }

  #[test]
  fn test_nested_serialize_trait() {
    let value = CompositeType { user_token: UserToken("U:foo".to_string()), string: "bar".to_string() };
    let expected = r#"{"user_token":"U:foo","string":"bar"}"#.to_string();
    assert_eq!(expected, serde_json::to_string(&value).unwrap());
  }

  #[test]
  fn test_deserialize_trait() {
    let payload = "\"U:foo\""; // NB: Quoted
    let expected  = "U:foo".to_string();

    let value : UserToken = serde_json::from_str(payload).unwrap();
    assert_eq!(value, UserToken(expected.clone()));

    // Just to show this deserializes the same way as a string
    let value : String = serde_json::from_str(payload).unwrap();
    assert_eq!(value, expected.clone());
  }

  #[test]
  fn test_nested_deserialize_trait() {
    let payload = r#"{"user_token":"U:foo","string":"bar"}"#.to_string();
    let expected = CompositeType {
      user_token: UserToken("U:foo".to_string()),
      string: "bar".to_string(),
    };

    assert_eq!(expected, serde_json::from_str::<CompositeType>(&payload).unwrap());
  }
}
