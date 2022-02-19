use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::column_types::twitch_event_category::TwitchEventCategory;
use crate::tokens::Tokens;
use sqlx::MySqlPool;

pub struct InsertVoiceCloneRequestBuilder {
  pub uuid_idempotency_token: String,

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

  pub ip_address_creation: String,
}

impl InsertVoiceCloneRequestBuilder {

  /// Returns the newly generated token.
  pub async fn insert(&self, mysql_pool: &MySqlPool) -> AnyhowResult<String> {

    let token = Tokens::new_voice_clone_request_token()?;

    let query = sqlx::query!(
        r#"
INSERT INTO voice_clone_requests
SET
  token = ?,
  uuid_idempotency_token = ?,

  maybe_user_token = ?,
  email_address = ?,
  discord_username = ?,

  is_for_studio = ?,
  is_for_twitch_tts = ?,
  is_for_api_use = ?,
  is_for_music = ?,
  is_for_games = ?,
  is_for_other = ?,
  optional_notes_on_use = ?,

  is_for_private_use = ?,
  is_for_public_use = ?,

  is_own_voice = ?,
  is_third_party_voice = ?,

  has_clean_audio_recordings = ?,
  has_good_microphone = ?,

  optional_questions = ?,
  optional_extra_comments = ?,

  ip_address_creation = ?
        "#,
      &token,
      &self.uuid_idempotency_token,

      &self.maybe_user_token,
      &self.email_address,
      &self.discord_username,

      &self.is_for_studio,
      &self.is_for_twitch_tts,
      &self.is_for_api_use,
      &self.is_for_music,
      &self.is_for_games,
      &self.is_for_other,
      &self.optional_notes_on_use,

      &self.is_for_private_use,
      &self.is_for_public_use,

      &self.is_own_voice,
      &self.is_third_party_voice,

      &self.has_clean_audio_recordings,
      &self.has_good_microphone,

      &self.optional_questions,
      &self.optional_extra_comments,

      &self.ip_address_creation,
    );

    let query_result = query.execute(mysql_pool).await;

    let _record_id = match query_result {
      Ok(res) => res.last_insert_id(),
      Err(err) => return Err(anyhow!("Error creating Voice Clone Request: {:?}", err)),
    };

    Ok(token)
  }
}
