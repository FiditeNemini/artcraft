use serde::{Deserializer, Serializer};
use std::fmt::{Debug, Display, Formatter};

// https://docs.rs/sqlx/latest/sqlx/trait.Type.html
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug)]
#[sqlx(transparent)]
pub struct UserToken(pub String);

// TODO: Macros should implement all of the following:

impl Display for UserToken {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.0)
  }
}

impl serde::Serialize for UserToken {
  fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
    serializer.serialize_str(&self.0)
  }
}

impl<'de> serde::Deserialize<'de> for UserToken {
  fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
    let s = String::deserialize(d)?;
    Ok(UserToken(s))
  }
}

#[cfg(test)]
mod tests {
  use crate::users::user::UserToken;

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
  fn test_deserialize_trait() {
    let payload = "\"U:foo\"";
    let expected  = "U:foo".to_string();

    let value : UserToken = serde_json::from_str(payload).unwrap();
    assert_eq!(value, UserToken(expected.clone()));

    // Just to show this deserializes the same way as a string
    let value : String = serde_json::from_str(payload).unwrap();
    assert_eq!(value, expected.clone());
  }
}