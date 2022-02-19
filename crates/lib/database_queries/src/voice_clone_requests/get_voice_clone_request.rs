use anyhow::anyhow;
use chrono::{Utc, DateTime};
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::twitch_event_category::TwitchEventCategory;
use crate::helpers::boolean_converters::i8_to_bool;
use sqlx::MySqlPool;

/// Used for both *BY TOKEN* and for *BY USER* lookups.
/// The user field should be optional for one and not for the other, but code reuse is more
/// important and this is a quick / hasty feature.
#[derive(Debug)]
pub struct VoiceCloneRequest {
  pub token: String,

  // Contact
  pub maybe_user_token: Option<String>,
  pub email_address: String,
  pub discord_username: String,

  // Use
  pub is_for_studio: bool,
  pub is_for_twitch_tts: bool,
  pub is_for_api_use: bool,
  pub is_for_music: bool,
  pub is_for_games: bool,
  pub is_for_other: bool,
  pub optional_notes_on_use: Option<String>,

  // Visibility
  pub is_for_private_use: bool,
  pub is_for_public_use: bool,

  // Ownership
  pub is_own_voice: bool,
  pub is_third_party_voice: bool,

  // Equipment
  pub has_clean_audio_recordings: bool,
  pub has_good_microphone: bool,

  // Comments
  pub optional_questions: Option<String>,
  pub optional_extra_comments: Option<String>,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
}

pub async fn get_voice_clone_request_by_token(
  voice_clone_request_token: &str,
  pool: &MySqlPool,
) -> AnyhowResult<Option<VoiceCloneRequest>> {

  let maybe_record = sqlx::query_as!(
      VoiceCloneRequestInternal,
        r#"
SELECT
  token,

  maybe_user_token,
  email_address,
  discord_username,

  is_for_studio,
  is_for_twitch_tts,
  is_for_api_use,
  is_for_music,
  is_for_games,
  is_for_other,
  optional_notes_on_use,

  is_for_private_use,
  is_for_public_use,

  is_own_voice,
  is_third_party_voice,

  has_clean_audio_recordings,
  has_good_microphone,

  optional_questions,
  optional_extra_comments,

  created_at,
  updated_at
FROM voice_clone_requests
WHERE
  token = ?
        "#,
      voice_clone_request_token,
    )
      .fetch_one(pool)
      .await;

  let record : VoiceCloneRequestInternal = match maybe_record {
    Ok(record) => record,
    Err(sqlx::Error::RowNotFound) => return Ok(None),
    Err(ref err) => return Err(anyhow!("database query error: {:?}", err)),
  };

  Ok(Some(VoiceCloneRequest {
    token: record.token,
    maybe_user_token: record.maybe_user_token,
    email_address: record.email_address,
    discord_username: record.discord_username,
    is_for_studio: i8_to_bool(record.is_for_studio),
    is_for_twitch_tts: i8_to_bool(record.is_for_twitch_tts),
    is_for_api_use: i8_to_bool(record.is_for_api_use),
    is_for_music: i8_to_bool(record.is_for_music),
    is_for_games: i8_to_bool(record.is_for_games),
    is_for_other: i8_to_bool(record.is_for_other),
    optional_notes_on_use: record.optional_notes_on_use,
    is_for_private_use: i8_to_bool(record.is_for_private_use),
    is_for_public_use: i8_to_bool(record.is_for_public_use),
    is_own_voice: i8_to_bool(record.is_own_voice),
    is_third_party_voice: i8_to_bool(record.is_third_party_voice),
    has_clean_audio_recordings: i8_to_bool(record.has_clean_audio_recordings),
    has_good_microphone: i8_to_bool(record.has_good_microphone),
    optional_questions: record.optional_questions,
    optional_extra_comments: record.optional_extra_comments,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }))
}

#[derive(Debug)]
struct VoiceCloneRequestInternal {
  pub token: String,

  // Contact
  pub maybe_user_token: Option<String>,
  pub email_address: String,
  pub discord_username: String,

  // Use
  pub is_for_studio: i8,
  pub is_for_twitch_tts: i8,
  pub is_for_api_use: i8,
  pub is_for_music: i8,
  pub is_for_games: i8,
  pub is_for_other: i8,
  pub optional_notes_on_use: Option<String>,

  // Visibility
  pub is_for_private_use: i8,
  pub is_for_public_use: i8,

  // Ownership
  pub is_own_voice: i8,
  pub is_third_party_voice: i8,

  // Equipment
  pub has_clean_audio_recordings: i8,
  pub has_good_microphone: i8,

  // Comments
  pub optional_questions: Option<String>,
  pub optional_extra_comments: Option<String>,

  pub created_at: chrono::DateTime<Utc>,
  pub updated_at: chrono::DateTime<Utc>,
}
