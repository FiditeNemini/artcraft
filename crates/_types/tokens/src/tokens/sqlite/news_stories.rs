use std::fmt::Debug;

use serde::Deserialize;
use serde::Serialize;

use crate::prefixes::EntityType;

/// The primary key for news stories (Sqlite)
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct NewsStoryToken(pub String);

impl_string_token!(NewsStoryToken);
impl_crockford_generator!(NewsStoryToken, 32usize, EntityType::NewsStory, CrockfordMixed);
