use actix_web::HttpRequest;
use anyhow::anyhow;
use crate::AnyhowResult;
use crate::http_server::web_utils::cookie_manager::CookieManager;
use log::{info, warn};
use sqlx::MySqlPool;
use sqlx::error::Error::RowNotFound;

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
  pub avatar_public_bucket_hash: Option<String>,

  // ===== PREFERENCES ===== //

  pub dark_mode_preference: String,
  pub disable_gravatar: bool,
  pub hide_results_preference: bool,
  pub auto_play_audio_preference: bool,
  pub auto_play_video_preference: bool,
  pub maybe_preferred_tts_model_token: Option<String>,
  pub maybe_preferred_w2l_template_token: Option<String>,

  // ===== ROLE ===== //

  pub user_role_slug: String,
  pub banned: bool,

  // ===== PERMISSIONS FLAGS ===== //

  pub can_ban_users: bool,
  pub can_edit_other_users_data: bool,
  pub can_approve_w2l_templates: bool,

  pub can_upload_tts_models: bool,
  pub can_upload_w2l_templates: bool,

  pub can_use_tts: bool,
  pub can_use_w2l: bool,
}

pub struct SessionUserRawDbRecord {
  pub user_token: String,
  pub username: String,
  pub display_name: String,

  pub email_address: String,
  pub email_confirmed: i8,
  pub email_gravatar_hash: String,
  pub avatar_public_bucket_hash: Option<String>,

  pub dark_mode_preference: String,
  pub disable_gravatar: i8,
  pub hide_results_preference: i8,
  pub auto_play_audio_preference: i8,
  pub auto_play_video_preference: i8,
  pub maybe_preferred_tts_model_token: Option<String>,
  pub maybe_preferred_w2l_template_token: Option<String>,

  pub user_role_slug: String,
  pub banned: i8,

  pub can_ban_users: Option<i8>,
  pub can_edit_other_users_data: Option<i8>,
  pub can_approve_w2l_templates: Option<i8>,

  pub can_upload_tts_models: Option<i8>,
  pub can_upload_w2l_templates: Option<i8>,

  pub can_use_tts: Option<i8>,
  pub can_use_w2l: Option<i8>,
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

  pub async fn maybe_get_user_session(&self, request: &HttpRequest, pool: &MySqlPool)
    -> AnyhowResult<Option<SessionUserRecord>>
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
    users.avatar_public_bucket_hash,

    users.dark_mode_preference,
    users.disable_gravatar,
    users.hide_results_preference,
    users.auto_play_audio_preference,
    users.auto_play_video_preference,
    users.maybe_preferred_tts_model_token,
    users.maybe_preferred_w2l_template_token,

    users.user_role_slug,
    users.banned,

    user_roles.can_ban_users,
    user_roles.can_edit_other_users_data,
    user_roles.can_approve_w2l_templates,

    user_roles.can_upload_tts_models,
    user_roles.can_upload_w2l_templates,

    user_roles.can_use_tts,
    user_roles.can_use_w2l

FROM users
LEFT OUTER JOIN user_sessions
    ON users.token = user_sessions.user_token
LEFT OUTER JOIN user_roles
    ON users.user_role_slug = user_roles.slug
WHERE user_sessions.token = ?
    AND user_sessions.deleted_at IS NULL
    AND users.deleted_at IS NULL
        "#,
        session_token.to_string(),
    )
      .fetch_one(pool)
      .await; // TODO: This will return error if it doesn't exist

    match maybe_user_record {
      Ok(raw_user_record) => {
        let result_user_record = SessionUserRecord {
          user_token: raw_user_record.user_token.clone(),
          username: raw_user_record.username.clone(),
          display_name: raw_user_record.display_name.clone(),
          email_address: raw_user_record.email_address.clone(),
          email_confirmed: if raw_user_record.email_confirmed == 0 { false } else { true },
          email_gravatar_hash: raw_user_record.email_gravatar_hash.clone(),
          avatar_public_bucket_hash: raw_user_record.avatar_public_bucket_hash.clone(),
          dark_mode_preference: raw_user_record.dark_mode_preference.clone(),
          disable_gravatar: if raw_user_record.disable_gravatar == 0 { false } else { true },
          hide_results_preference: if raw_user_record.hide_results_preference == 0 { false } else { true },
          auto_play_audio_preference: if raw_user_record.auto_play_audio_preference == 0 { false } else { true },
          auto_play_video_preference: if raw_user_record.auto_play_video_preference == 0 { false } else { true },
          maybe_preferred_tts_model_token: raw_user_record.maybe_preferred_tts_model_token.clone(),
          maybe_preferred_w2l_template_token: raw_user_record.maybe_preferred_w2l_template_token.clone(),
          user_role_slug: raw_user_record.user_role_slug.clone(),
          banned: if raw_user_record.banned == 0 { false } else { true },
          can_ban_users: convert_optional_db_bool_default_false(raw_user_record.can_ban_users),
          can_edit_other_users_data: convert_optional_db_bool_default_false(raw_user_record.can_edit_other_users_data),
          can_approve_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_approve_w2l_templates),
          can_upload_tts_models: convert_optional_db_bool_default_false(raw_user_record.can_upload_tts_models),
          can_upload_w2l_templates: convert_optional_db_bool_default_false(raw_user_record.can_upload_w2l_templates),
          can_use_tts: convert_optional_db_bool_default_false(raw_user_record.can_use_tts),
          can_use_w2l: convert_optional_db_bool_default_false(raw_user_record.can_use_w2l),
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
