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
