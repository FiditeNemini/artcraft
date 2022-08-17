// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::HttpRequest;
use anyhow::anyhow;
use crate::AnyhowResult;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use database_queries::column_types::record_visibility::RecordVisibility;
use database_queries::helpers::boolean_converters::{nullable_i8_to_optional_bool, i8_to_bool};
use log::warn;
use sqlx::error::Error::RowNotFound;
use sqlx::pool::PoolConnection;
use sqlx::{MySqlPool, MySql};

#[derive(Clone)]
pub struct SessionChecker {
  cookie_manager: CookieManager,
}

pub struct SessionRecord {
  pub session_token: String,
  pub user_token: String,
}

pub struct SessionUserRecord {
  pub user_token: String,
  pub username: String,
  pub display_name: String,

  pub email_address: String,
  pub email_confirmed: bool,
  pub email_gravatar_hash: String,

  // ===== PREFERENCES ===== //

  pub disable_gravatar: bool,
  pub auto_play_audio_preference: Option<bool>,
  pub preferred_tts_result_visibility: RecordVisibility,
  pub preferred_w2l_result_visibility: RecordVisibility,
  pub auto_play_video_preference: Option<bool>,

  // ===== ROLE ===== //

  pub user_role_slug: String,
  pub is_banned: bool,

  // ===== PERMISSIONS FLAGS ===== //

  // Usage
  pub can_use_tts: bool,
  pub can_use_w2l: bool,
  pub can_delete_own_tts_results: bool,
  pub can_delete_own_w2l_results: bool,
  pub can_delete_own_account: bool,

  // Contribution
  pub can_upload_tts_models: bool,
  pub can_upload_w2l_templates: bool,
  pub can_delete_own_tts_models: bool,
  pub can_delete_own_w2l_templates: bool,

  // Moderation
  pub can_approve_w2l_templates: bool,
  pub can_edit_other_users_profiles: bool,
  pub can_edit_other_users_tts_models: bool,
  pub can_edit_other_users_w2l_templates: bool,
  pub can_delete_other_users_tts_models: bool,
  pub can_delete_other_users_tts_results: bool,
  pub can_delete_other_users_w2l_templates: bool,
  pub can_delete_other_users_w2l_results: bool,
  pub can_ban_users: bool,
  pub can_delete_users: bool,
}

pub struct SessionUserRawDbRecord {
  pub user_token: String,
  pub username: String,
  pub display_name: String,

  pub email_address: String,
  pub email_confirmed: i8,
  pub email_gravatar_hash: String,

  pub disable_gravatar: i8,
  pub auto_play_audio_preference: Option<i8>,
  pub auto_play_video_preference: Option<i8>,
  pub preferred_tts_result_visibility: RecordVisibility,
  pub preferred_w2l_result_visibility: RecordVisibility,

  pub user_role_slug: String,
  pub is_banned: i8,

  // NB: These are `Option` due to the JOIN not being compile-time assured.
  // Usage
  pub can_use_tts: Option<i8>,
  pub can_use_w2l: Option<i8>,
  pub can_delete_own_tts_results: Option<i8>,
  pub can_delete_own_w2l_results: Option<i8>,
  pub can_delete_own_account: Option<i8>,

  // Contribution
  pub can_upload_tts_models: Option<i8>,
  pub can_upload_w2l_templates: Option<i8>,
  pub can_delete_own_tts_models: Option<i8>,
  pub can_delete_own_w2l_templates: Option<i8>,

  // Moderation
  pub can_approve_w2l_templates: Option<i8>,
  pub can_edit_other_users_profiles: Option<i8>,
  pub can_edit_other_users_tts_models: Option<i8>,
  pub can_edit_other_users_w2l_templates: Option<i8>,
  pub can_delete_other_users_tts_models: Option<i8>,
  pub can_delete_other_users_tts_results: Option<i8>,
  pub can_delete_other_users_w2l_templates: Option<i8>,
  pub can_delete_other_users_w2l_results: Option<i8>,
  pub can_ban_users: Option<i8>,
  pub can_delete_users: Option<i8>,
}

impl SessionChecker {

  pub fn new(cookie_manager: &CookieManager) -> Self {
    Self {
      cookie_manager: cookie_manager.clone(),
    }
  }

  pub async fn maybe_get_session(&self, request: &HttpRequest, pool: &MySqlPool)
    -> AnyhowResult<Option<SessionRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    // NB: Lookup failure is Err(RowNotFound).
    let maybe_session_record = sqlx::query_as!(
      SessionRecord,
        r#"
SELECT
    token as session_token,
    user_token
FROM user_sessions
WHERE token = ?
AND deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
      .fetch_one(pool)
      .await; // TODO: This will return error if it doesn't exist

    match maybe_session_record {
      Ok(session_record) => {
        Ok(Some(session_record))
      },
      Err(err) => {
        match err {
          RowNotFound => {
            warn!("Valid cookie; invalid session: {}", session_token);
            Ok(None)
          },
          _ => {
            warn!("Session query error: {:?}", err);
            Err(anyhow!("session query error: {:?}", err))
          }
        }
      }
    }
  }

  #[deprecated = "Use the PoolConnection method"]
  pub async fn maybe_get_user_session(
    &self,
    request: &HttpRequest,
    pool: &MySqlPool,
  ) -> AnyhowResult<Option<SessionUserRecord>>
  {
    let mut connection = pool.acquire().await?;
    self.maybe_get_user_session_from_connection(request, &mut connection).await
  }

  pub async fn maybe_get_user_session_from_connection(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<SessionUserRecord>>
  {

    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    // NB: Lookup failure is Err(RowNotFound).
    let maybe_user_record = sqlx::query_as!(
      SessionUserRawDbRecord,
        r#"
SELECT
    users.token as user_token,
    users.username,
    users.display_name,

    users.email_address,
    users.email_confirmed,
    users.email_gravatar_hash,

    users.disable_gravatar,
    users.auto_play_audio_preference,
    users.auto_play_video_preference,
    users.preferred_tts_result_visibility as `preferred_tts_result_visibility: database_queries::column_types::record_visibility::RecordVisibility`,
    users.preferred_w2l_result_visibility as `preferred_w2l_result_visibility: database_queries::column_types::record_visibility::RecordVisibility`,

    users.user_role_slug,
    users.is_banned,

    user_roles.can_use_tts,
    user_roles.can_use_w2l,
    user_roles.can_delete_own_tts_results,
    user_roles.can_delete_own_w2l_results,
    user_roles.can_delete_own_account,

    user_roles.can_upload_tts_models,
    user_roles.can_upload_w2l_templates,
    user_roles.can_delete_own_tts_models,
    user_roles.can_delete_own_w2l_templates,

    user_roles.can_approve_w2l_templates,
    user_roles.can_edit_other_users_profiles,
    user_roles.can_edit_other_users_tts_models,
    user_roles.can_edit_other_users_w2l_templates,
    user_roles.can_delete_other_users_tts_models,
    user_roles.can_delete_other_users_tts_results,
    user_roles.can_delete_other_users_w2l_templates,
    user_roles.can_delete_other_users_w2l_results,
    user_roles.can_ban_users,
    user_roles.can_delete_users

FROM users
LEFT OUTER JOIN user_sessions
    ON users.token = user_sessions.user_token
LEFT OUTER JOIN user_roles
    ON users.user_role_slug = user_roles.slug
WHERE user_sessions.token = ?
    AND user_sessions.deleted_at IS NULL
    AND users.user_deleted_at IS NULL
    AND users.mod_deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
      .fetch_one(mysql_connection)
      .await; // TODO: This will return error if it doesn't exist

    match maybe_user_record {
      Ok(raw_user_record) => {
        let result_user_record = SessionUserRecord {
          user_token: raw_user_record.user_token,
          username: raw_user_record.username,
          display_name: raw_user_record.display_name,
          email_address: raw_user_record.email_address,
          email_confirmed: i8_to_bool(raw_user_record.email_confirmed),
          email_gravatar_hash: raw_user_record.email_gravatar_hash,
          // Preference
          disable_gravatar: i8_to_bool(raw_user_record.disable_gravatar),
          auto_play_audio_preference: nullable_i8_to_optional_bool(raw_user_record.auto_play_audio_preference),
          auto_play_video_preference: nullable_i8_to_optional_bool(raw_user_record.auto_play_video_preference),
          user_role_slug: raw_user_record.user_role_slug,
          preferred_tts_result_visibility: raw_user_record.preferred_tts_result_visibility,
          preferred_w2l_result_visibility: raw_user_record.preferred_w2l_result_visibility,

          is_banned: i8_to_bool(raw_user_record.is_banned),

          // Usage
          can_use_tts: convert_optional_db_bool_default_false(raw_user_record.can_use_tts),
          can_use_w2l: convert_optional_db_bool_default_false(raw_user_record.can_use_w2l),
          can_delete_own_tts_results: convert_optional_db_bool_default_false(raw_user_record.can_delete_own_tts_results),
          can_delete_own_w2l_results: convert_optional_db_bool_default_false(raw_user_record.can_delete_own_w2l_results),
          can_delete_own_account: convert_optional_db_bool_default_false(raw_user_record.can_delete_own_account),
          // Contribution
          can_upload_tts_models: convert_optional_db_bool_default_false(raw_user_record.can_upload_tts_models),
          can_upload_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_upload_w2l_templates),
          can_delete_own_tts_models: convert_optional_db_bool_default_false(raw_user_record.can_delete_own_tts_models),
          can_delete_own_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_delete_own_w2l_templates),
          // Moderation
          can_approve_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_approve_w2l_templates),
          can_edit_other_users_profiles: convert_optional_db_bool_default_false(raw_user_record.can_edit_other_users_profiles),
          can_edit_other_users_tts_models: convert_optional_db_bool_default_false(raw_user_record.can_edit_other_users_tts_models),
          can_edit_other_users_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_edit_other_users_w2l_templates),
          can_delete_other_users_tts_models: convert_optional_db_bool_default_false(raw_user_record.can_delete_other_users_tts_models),
          can_delete_other_users_tts_results: convert_optional_db_bool_default_false(raw_user_record.can_delete_other_users_tts_results),
          can_delete_other_users_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_delete_other_users_w2l_templates),
          can_delete_other_users_w2l_results: convert_optional_db_bool_default_false(raw_user_record.can_delete_other_users_w2l_results),
          can_ban_users: convert_optional_db_bool_default_false(raw_user_record.can_ban_users),
          can_delete_users: convert_optional_db_bool_default_false(raw_user_record.can_delete_users) ,
        };

        Ok(Some(result_user_record))
      },
      Err(err) => {
        match err {
          RowNotFound => {
            warn!("Valid cookie; invalid session: {}", session_token);
            Ok(None)
          },
          _ => {
            warn!("Session query error: {:?}", err);
            Err(anyhow!("session query error: {:?}", err))
          }
        }
      }
    }
  }
}

fn convert_optional_db_bool_default_false(value: Option<i8>) -> bool {
  match value {
    None => false,
    Some(v) => match v {
      0 => false,
      _ => true,
    }
  }
}
