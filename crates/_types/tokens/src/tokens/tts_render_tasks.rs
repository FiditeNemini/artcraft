use crate::prefixes::EntityType;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

/// The primary key for TTS render tasks (Sqlite / AiChatBotSidecar)
#[derive(Clone, PartialEq, Eq, sqlx::Type, Debug, Serialize, Deserialize)]
#[sqlx(transparent)]
pub struct TtsRenderTaskToken(pub String);

impl_string_token!(TtsRenderTaskToken);
impl_crockford_generator!(TtsRenderTaskToken, 32usize, EntityType::TtsRenderTask, CrockfordMixed);
