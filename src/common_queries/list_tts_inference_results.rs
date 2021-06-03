use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::util::anyhow_result::AnyhowResult;
use log::{warn, info};
use sqlx::MySqlPool;

#[derive(Serialize)]
pub struct TtsInferenceRecordForList {
  pub tts_result_token: String,
  pub maybe_tts_model_token: Option<String>,
  pub maybe_tts_inference_result_token: Option<String>,

  pub model_type: Option<String>,
  pub model_title: Option<String>,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: u32,
  pub frame_width: u32,
  pub frame_height: u32,
  pub duration_millis: u32,

  //pub is_mod_hidden_from_public: bool, // converted
  //pub model_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

struct RawTtsInferenceRecordForList {
  pub tts_result_token: String, // from field `tts_results.token`

  pub maybe_tts_model_token: Option<String>,
  pub maybe_tts_inference_result_token: Option<String>,

  pub model_type: Option<String>,
  pub model_title: Option<String>, // from field `tts_models.title`

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: i32,
  pub frame_width: i32,
  pub frame_height: i32,
  pub duration_millis: i32,

  //pub is_mod_hidden_from_public: i8, // needs convert
  //pub model_is_mod_approved: i8, // needs convert
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn list_tts_inference_results(
  mysql_pool: &MySqlPool,
  scope_creator_username: Option<&str>,
  require_mod_approved_models: bool
) -> AnyhowResult<Vec<TtsInferenceRecordForList>> {

  let maybe_results = match scope_creator_username {
    Some(username) => {
      list_tts_inference_results_creator_scoped(mysql_pool, username, require_mod_approved_models)
        .await
    },
    None => {
      list_tts_inference_results_for_all_creators(mysql_pool, require_mod_approved_models)
        .await
    },
  };

  let results : Vec<RawTtsInferenceRecordForList> = match maybe_results {
    Ok(results) => {
      info!("Results length: {}", results.len());
      results
    },
    Err(err) => {
      warn!("Error: {:?}", err);

      match err {
        RowNotFound => {
          return Ok(Vec::new());
        },
        _ => {
          warn!("tts inference result list query error: {:?}", err);
          return Err(anyhow!("tts inference result list query error"));
        }
      }
    }
  };

  Ok(results.into_iter()
    .map(|ir| {
      TtsInferenceRecordForList {
        tts_result_token: ir.tts_result_token.clone(),
        maybe_tts_model_token: ir.maybe_tts_model_token.clone(),
        maybe_tts_inference_result_token: ir.maybe_tts_inference_result_token.clone(),

        model_type: ir.model_type.clone(),
        model_title: ir.model_title.clone(),

        maybe_creator_user_token: ir.maybe_creator_user_token.clone(),
        maybe_creator_username: ir.maybe_creator_username.clone(),
        maybe_creator_display_name: ir.maybe_creator_display_name.clone(),
        //is_mod_hidden_from_public: if ir.is_mod_hidden_from_public == 0 { false } else { true },
        //model_is_mod_approved: if ir.model_is_mod_approved == 0 { false } else { true },

        file_size_bytes: if ir.file_size_bytes > 0 { ir.file_size_bytes as u32 } else { 0 },
        frame_width: if ir.frame_width > 0 { ir.frame_width as u32 } else { 0 },
        frame_height: if ir.frame_height  > 0 { ir.frame_height as u32 } else { 0 },
        duration_millis: if ir.duration_millis > 0 { ir.duration_millis as u32 } else { 0 },

        created_at: ir.created_at.clone(),
        updated_at: ir.updated_at.clone(),
      }
    })
    .collect::<Vec<TtsInferenceRecordForList>>())
}

async fn list_tts_inference_results_for_all_creators(
  mysql_pool: &MySqlPool,
  require_mod_approved_models: bool
) -> AnyhowResult<Vec<RawTtsInferenceRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_results = if require_mod_approved_models {
    info!("listing tts inference results for everyone; mod-approved only");
    sqlx::query_as!(
      RawTtsInferenceRecordForList,
        r#"
SELECT
    tts_results.token as tts_result_token,
    tts_results.maybe_tts_inference_result_token,

    tts_models.token as maybe_tts_model_token,
    tts_models.model_type,
    tts_models.title as model_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.frame_width,
    tts_results.frame_height,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.maybe_tts_model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
WHERE
    tts_results.deleted_at IS NULL
    AND tts_results.is_mod_hidden_from_public IS FALSE
    AND tts_models.is_mod_approved IS TRUE
        "#)
      .fetch_all(mysql_pool)
      .await?
  } else {
    info!("listing tts inference results for everyone; all");
    sqlx::query_as!(
      RawTtsInferenceRecordForList,
        r#"
SELECT
    tts_results.token as tts_result_token,
    tts_results.maybe_tts_inference_result_token,

    tts_models.token as maybe_tts_model_token,
    tts_models.model_type,
    tts_models.title as model_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.frame_width,
    tts_results.frame_height,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.maybe_tts_model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
WHERE
    tts_results.deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_results)
}

async fn list_tts_inference_results_creator_scoped(
  mysql_pool: &MySqlPool,
  scope_creator_username: &str,
  require_mod_approved_models: bool
) -> AnyhowResult<Vec<RawTtsInferenceRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_results = if require_mod_approved_models {
    info!("listing tts inference results for user `{}`; mod-approved only", scope_creator_username);
    sqlx::query_as!(
      RawTtsInferenceRecordForList,
        r#"
SELECT
    tts_results.token as tts_result_token,
    tts_results.maybe_tts_inference_result_token,

    tts_models.token as maybe_tts_model_token,
    tts_models.model_type,
    tts_models.title as model_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.frame_width,
    tts_results.frame_height,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.maybe_tts_model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
WHERE
    tts_results.deleted_at IS NULL
    AND tts_results.is_mod_hidden_from_public IS FALSE
    AND tts_models.is_mod_approved IS TRUE
    AND users.username = ?
        "#,
    scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  } else {
    info!("listing tts inference results for user `{}`; all", scope_creator_username);
    sqlx::query_as!(
      RawTtsInferenceRecordForList,
        r#"
SELECT
    tts_results.token as tts_result_token,
    tts_results.maybe_tts_inference_result_token,

    tts_models.token as maybe_tts_model_token,
    tts_models.model_type,
    tts_models.title as model_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.frame_width,
    tts_results.frame_height,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
  ON tts_results.maybe_tts_model_token = tts_models.token
LEFT OUTER JOIN users
  ON tts_results.maybe_creator_user_token = users.token
WHERE
    tts_results.deleted_at IS NULL
    AND users.username = ?
        "#,
    scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_results)
}
