use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for news stories (Sqlite)
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct NewsStoryToken(pub String);

impl_string_token!(NewsStoryToken);
impl_crockford_generator!(NewsStoryToken, 32usize, EntityType::NewsStory, CrockfordMixed);
