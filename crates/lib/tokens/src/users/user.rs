use serde::{Deserializer, Serializer};
use std::fmt::{Debug, Display, Formatter};

// https://docs.rs/sqlx/latest/sqlx/trait.Type.html
#[derive(Clone, PartialEq, Eq, sqlx::Type)]
#[sqlx(transparent)]
pub struct UserToken(pub String);

// TODO: Macros should implement all of the following:

impl Display for UserToken {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.0)
  }
}

impl Debug for UserToken {
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
