use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::util::anyhow_result::AnyhowResult;
use log::{warn, info};
use sqlx::MySqlPool;

#[derive(Serialize)]
pub struct W2lInferenceRecordForList {
  pub w2l_result_token: String,
  pub maybe_w2l_template_token: Option<String>,
  pub maybe_tts_inference_result_token: Option<String>,

  pub template_type: Option<String>,
  pub template_title: Option<String>,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: u32,
  pub frame_width: u32,
  pub frame_height: u32,
  pub duration_millis: u32,

  //pub is_mod_hidden_from_public: bool, // converted
  //pub template_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

struct RawW2lInferenceRecordForList {
  pub w2l_result_token: String, // from field `w2l_results.token`

  pub maybe_w2l_template_token: Option<String>,
  pub maybe_tts_inference_result_token: Option<String>,

  pub template_type: Option<String>,
  pub template_title: Option<String>, // from field `w2l_templates.title`

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: i32,
  pub frame_width: i32,
  pub frame_height: i32,
  pub duration_millis: i32,

  //pub is_mod_hidden_from_public: i8, // needs convert
  //pub template_is_mod_approved: i8, // needs convert
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn list_w2l_inference_results(
  mysql_pool: &MySqlPool,
  scope_creator_username: Option<&str>,
  require_mod_approved_templates: bool
) -> AnyhowResult<Vec<W2lInferenceRecordForList>> {

  let maybe_results = match scope_creator_username {
    Some(username) => {
      list_w2l_inference_results_creator_scoped(mysql_pool, username, require_mod_approved_templates)
        .await
    },
    None => {
      list_w2l_inference_results_for_all_creators(mysql_pool, require_mod_approved_templates)
        .await
    },
  };

  let results : Vec<RawW2lInferenceRecordForList> = match maybe_results {
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
          warn!("w2l inference result list query error: {:?}", err);
          return Err(anyhow!("w2l inference result list query error"));
        }
      }
    }
  };

  Ok(results.into_iter()
    .map(|ir| {
      W2lInferenceRecordForList {
        w2l_result_token: ir.w2l_result_token.clone(),
        maybe_w2l_template_token: ir.maybe_w2l_template_token.clone(),
        maybe_tts_inference_result_token: ir.maybe_tts_inference_result_token.clone(),

        template_type: ir.template_type.clone(),
        template_title: ir.template_title.clone(),

        maybe_creator_user_token: ir.maybe_creator_user_token.clone(),
        maybe_creator_username: ir.maybe_creator_username.clone(),
        maybe_creator_display_name: ir.maybe_creator_display_name.clone(),
        //is_mod_hidden_from_public: if ir.is_mod_hidden_from_public == 0 { false } else { true },
        //template_is_mod_approved: if ir.template_is_mod_approved == 0 { false } else { true },

        file_size_bytes: if ir.file_size_bytes > 0 { ir.file_size_bytes as u32 } else { 0 },
        frame_width: if ir.frame_width > 0 { ir.frame_width as u32 } else { 0 },
        frame_height: if ir.frame_height  > 0 { ir.frame_height as u32 } else { 0 },
        duration_millis: if ir.duration_millis > 0 { ir.duration_millis as u32 } else { 0 },

        created_at: ir.created_at.clone(),
        updated_at: ir.updated_at.clone(),
      }
    })
    .collect::<Vec<W2lInferenceRecordForList>>())
}

async fn list_w2l_inference_results_for_all_creators(
  mysql_pool: &MySqlPool,
  require_mod_approved_templates: bool
) -> AnyhowResult<Vec<RawW2lInferenceRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_results = if require_mod_approved_templates {
    info!("listing w2l inference results for everyone; mod-approved only");
    sqlx::query_as!(
      RawW2lInferenceRecordForList,
        r#"
SELECT
    w2l_results.token as w2l_result_token,
    w2l_results.maybe_tts_inference_result_token,

    w2l_templates.token as maybe_w2l_template_token,
    w2l_templates.template_type,
    w2l_templates.title as template_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    w2l_results.file_size_bytes,
    w2l_results.frame_width,
    w2l_results.frame_height,
    w2l_results.duration_millis,
    w2l_results.created_at,
    w2l_results.updated_at

FROM w2l_results
LEFT OUTER JOIN w2l_templates
    ON w2l_results.maybe_w2l_template_token = w2l_templates.token
LEFT OUTER JOIN users
    ON w2l_results.maybe_creator_user_token = users.token
WHERE
    w2l_results.is_mod_hidden_from_public IS FALSE
    AND w2l_templates.is_mod_public_listing_approved IS TRUE
    AND w2l_results.user_deleted_at IS NULL
    AND w2l_results.mod_deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  } else {
    info!("listing w2l inference results for everyone; all");
    sqlx::query_as!(
      RawW2lInferenceRecordForList,
        r#"
SELECT
    w2l_results.token as w2l_result_token,
    w2l_results.maybe_tts_inference_result_token,

    w2l_templates.token as maybe_w2l_template_token,
    w2l_templates.template_type,
    w2l_templates.title as template_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    w2l_results.file_size_bytes,
    w2l_results.frame_width,
    w2l_results.frame_height,
    w2l_results.duration_millis,
    w2l_results.created_at,
    w2l_results.updated_at

FROM w2l_results
LEFT OUTER JOIN w2l_templates
    ON w2l_results.maybe_w2l_template_token = w2l_templates.token
LEFT OUTER JOIN users
    ON w2l_results.maybe_creator_user_token = users.token
WHERE
    w2l_results.user_deleted_at IS NULL
    AND w2l_results.mod_deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_results)
}

async fn list_w2l_inference_results_creator_scoped(
  mysql_pool: &MySqlPool,
  scope_creator_username: &str,
  require_mod_approved_templates: bool
) -> AnyhowResult<Vec<RawW2lInferenceRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_results = if require_mod_approved_templates {
    info!("listing w2l inference results for user `{}`; mod-approved only", scope_creator_username);
    sqlx::query_as!(
      RawW2lInferenceRecordForList,
        r#"
SELECT
    w2l_results.token as w2l_result_token,
    w2l_results.maybe_tts_inference_result_token,

    w2l_templates.token as maybe_w2l_template_token,
    w2l_templates.template_type,
    w2l_templates.title as template_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    w2l_results.file_size_bytes,
    w2l_results.frame_width,
    w2l_results.frame_height,
    w2l_results.duration_millis,
    w2l_results.created_at,
    w2l_results.updated_at

FROM w2l_results
LEFT OUTER JOIN w2l_templates
    ON w2l_results.maybe_w2l_template_token = w2l_templates.token
LEFT OUTER JOIN users
    ON w2l_results.maybe_creator_user_token = users.token
WHERE
    users.username = ?
    AND w2l_results.is_mod_hidden_from_public IS FALSE
    AND w2l_templates.is_mod_public_listing_approved IS TRUE
    AND w2l_results.user_deleted_at IS NULL
    AND w2l_results.mod_deleted_at IS NULL
        "#,
    scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  } else {
    info!("listing w2l inference results for user `{}`; all", scope_creator_username);
    sqlx::query_as!(
      RawW2lInferenceRecordForList,
        r#"
SELECT
    w2l_results.token as w2l_result_token,
    w2l_results.maybe_tts_inference_result_token,

    w2l_templates.token as maybe_w2l_template_token,
    w2l_templates.template_type,
    w2l_templates.title as template_title,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    w2l_results.file_size_bytes,
    w2l_results.frame_width,
    w2l_results.frame_height,
    w2l_results.duration_millis,
    w2l_results.created_at,
    w2l_results.updated_at

FROM w2l_results
LEFT OUTER JOIN w2l_templates
    ON w2l_results.maybe_w2l_template_token = w2l_templates.token
LEFT OUTER JOIN users
    ON w2l_results.maybe_creator_user_token = users.token
WHERE
    users.username = ?
    AND w2l_results.user_deleted_at IS NULL
    AND w2l_results.mod_deleted_at IS NULL
        "#,
    scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_results)
}
