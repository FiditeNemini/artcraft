use serde::{Deserializer, Serializer};

use sqlx_core::database::{Database, HasValueRef};
use sqlx_core::decode::Decode;
use std::error::Error;
use std::fmt::{Debug, Display, Formatter};

#[derive(Clone, PartialEq, Eq, sqlx::Type)]
pub struct UserToken {
  pub value: String,
}

// TODO: Macros should implement all of the following:

impl Display for UserToken {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.value)
  }
}

impl Debug for UserToken {
  fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.value)
  }
}

impl serde::Serialize for UserToken {
  fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
    serializer.serialize_str(&self.value)
  }
}

impl<'de> serde::Deserialize<'de> for UserToken {
  fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
    let s = String::deserialize(d)?;
    Ok(UserToken { value: s })
  }
}

// DB is the database driver
// `'r` is the lifetime of the `Row` being decoded
impl<'r, DB: Database> Decode<'r, DB> for UserToken
  where
  // we want to delegate some of the work to string decoding so let's make sure strings
  // are supported by the database
      &'r str: Decode<'r, DB>
{
  fn decode(
    value: <DB as HasValueRef<'r>>::ValueRef,
  ) -> Result<UserToken, Box<dyn Error + 'static + Send + Sync>> {
    // the interface of ValueRef is largely unstable at the moment
    // so this is not directly implementable

    // however, you can delegate to a type that matches the format of the type you want
    // to decode (such as a UTF-8 string)

    let value = <&str as Decode<DB>>::decode(value)?;

    // now you can parse this into your type (assuming there is a `FromStr`)

    Ok(UserToken { value: value.to_string() })
  }
}
