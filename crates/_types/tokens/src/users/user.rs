use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

// FIXME: I think that this file+module structure is an anti-pattern.
//  In the future, we should create two top-level directories: /tokens and /ids, and each token or
//  ID type should be in its own file. (NB: single files cannot share token definitions due to the
//  macro generating test modules that would conflict.)

/// The primary key for users.
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct UserToken(pub String);

impl_string_token!(UserToken);
impl_crockford_generator!(UserToken, 15usize, EntityType::User, CrockfordUpper);
