use anyhow::anyhow;
use chrono::{DateTime, Utc};
use crate::util::anyhow_result::AnyhowResult;
use log::{warn, info};
use sqlx::MySqlPool;

#[derive(Serialize)]
pub struct TtsInferenceListPage {
  pub inference_records: Vec<TtsInferenceRecordForList>,
  pub sort_ascending: bool,
  pub first_id: Option<i64>,
  pub last_id: Option<i64>,
}

#[derive(Serialize)]
pub struct TtsInferenceRecordForList {
  pub tts_result_token: String,

  pub tts_model_token: String,
  pub raw_inference_text: String,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: u32,
  pub duration_millis: u32,

  //pub model_is_mod_approved: bool, // converted
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

struct RawTtsInferenceRecordForList {
  pub tts_result_token: String, // from field `tts_results.token`

  pub tts_model_token: String,
  pub raw_inference_text: String,

  pub maybe_creator_user_token: Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes: i32,
  pub duration_millis: i32,

  //pub model_is_mod_approved: i8, // needs convert
  //pub maybe_mod_user_token: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub async fn list_tts_inference_results(
  mysql_pool: &MySqlPool,
  scope_creator_username: Option<&str>,
  block_mod_disabled_models: bool
) -> AnyhowResult<Vec<TtsInferenceRecordForList>> {

  let maybe_results = match scope_creator_username {
    Some(username) => {
      list_tts_inference_results_creator_scoped(mysql_pool, username, block_mod_disabled_models)
        .await
    },
    None => {
      list_tts_inference_results_for_all_creators(mysql_pool, block_mod_disabled_models)
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

        tts_model_token: ir.tts_model_token.clone(),
        raw_inference_text: ir.raw_inference_text.clone(),

        maybe_creator_user_token: ir.maybe_creator_user_token.clone(),
        maybe_creator_username: ir.maybe_creator_username.clone(),
        maybe_creator_display_name: ir.maybe_creator_display_name.clone(),
        //model_is_mod_approved: if ir.model_is_mod_approved == 0 { false } else { true },

        file_size_bytes: if ir.file_size_bytes > 0 { ir.file_size_bytes as u32 } else { 0 },
        duration_millis: if ir.duration_millis > 0 { ir.duration_millis as u32 } else { 0 },

        created_at: ir.created_at.clone(),
        updated_at: ir.updated_at.clone(),
      }
    })
    .collect::<Vec<TtsInferenceRecordForList>>())
}

async fn list_tts_inference_results_for_all_creators(
  mysql_pool: &MySqlPool,
  block_mod_disabled_models : bool
) -> AnyhowResult<Vec<RawTtsInferenceRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_results = if block_mod_disabled_models {
    info!("listing tts inference results for everyone; mod-approved only");
    sqlx::query_as!(
      RawTtsInferenceRecordForList,
        r#"
SELECT
    tts_results.token as tts_result_token,

    tts_results.model_token as tts_model_token,
    tts_results.raw_inference_text as raw_inference_text,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
    ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
    ON tts_results.maybe_creator_user_token = users.token
WHERE
    tts_models.is_locked_from_use IS FALSE
    AND tts_results.user_deleted_at IS NULL
    AND tts_results.mod_deleted_at IS NULL
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

    tts_results.model_token as tts_model_token,
    tts_results.raw_inference_text as raw_inference_text,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
    ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
    ON tts_results.maybe_creator_user_token = users.token
WHERE
    tts_results.user_deleted_at IS NULL
    AND tts_results.mod_deleted_at IS NULL
        "#)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_results)
}

async fn list_tts_inference_results_creator_scoped(
  mysql_pool: &MySqlPool,
  scope_creator_username: &str,
  block_mod_disabled : bool
) -> AnyhowResult<Vec<RawTtsInferenceRecordForList>> {
  // TODO: There has to be a better way.
  //  Sqlx doesn't like anything except string literals.
  let maybe_results = if block_mod_disabled {
    info!("listing tts inference results for user `{}`; mod-approved only", scope_creator_username);
    sqlx::query_as!(
      RawTtsInferenceRecordForList,
        r#"
SELECT
    tts_results.token as tts_result_token,

    tts_results.model_token as tts_model_token,
    tts_results.raw_inference_text as raw_inference_text,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
    ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
    ON tts_results.maybe_creator_user_token = users.token
WHERE
    users.username = ?
    AND tts_models.is_locked_from_use IS FALSE
    AND tts_results.user_deleted_at IS NULL
    AND tts_results.mod_deleted_at IS NULL
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

    tts_results.model_token as tts_model_token,
    tts_results.raw_inference_text as raw_inference_text,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
    ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
    ON tts_results.maybe_creator_user_token = users.token
WHERE
    users.username = ?
    AND tts_results.user_deleted_at IS NULL
    AND tts_results.mod_deleted_at IS NULL
        "#,
    scope_creator_username)
      .fetch_all(mysql_pool)
      .await?
  };

  Ok(maybe_results)
}

#[derive(sqlx::FromRow)]
pub struct RawInternalTtsRecord {
  pub tts_result_id: i64,
  pub tts_result_token: String,

  pub tts_model_token: String,
  pub raw_inference_text: String,

  pub maybe_creator_user_token : Option<String>,
  pub maybe_creator_username: Option<String>,
  pub maybe_creator_display_name: Option<String>,

  pub file_size_bytes : i64,
  pub duration_millis : i64,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

/// Paginated queries.
pub async fn list_tts_inference_page(
  mysql_pool: &MySqlPool,
  scope_creator_username: Option<&str>,
  sort_ascending: bool,
  cursor_is_previous: bool,
  block_mod_disabled : bool,
  limit: u16,
  offset: Option<u64>,
) -> AnyhowResult<TtsInferenceListPage> {

  let inference_results = list_tts_inference_results_query(
    mysql_pool,
    scope_creator_username,
    sort_ascending,
    cursor_is_previous,
    block_mod_disabled,
    limit,
    offset
  ).await?;

  let mut first_id = inference_results.first()
      .map(|raw_result| raw_result.tts_result_id);

  let mut last_id = inference_results.last()
      .map(|raw_result| raw_result.tts_result_id);

  let inference_results = inference_results
      .iter()
      .map(|r| {
        TtsInferenceRecordForList {
          tts_result_token: r.tts_result_token.clone(),
          tts_model_token: r.tts_model_token.clone(),
          raw_inference_text: r.raw_inference_text.clone(),
          maybe_creator_user_token: r.maybe_creator_user_token.clone(),
          maybe_creator_username: r.maybe_creator_username.clone(),
          maybe_creator_display_name: r.maybe_creator_display_name.clone(),
          file_size_bytes: if r.file_size_bytes > 0 { r.file_size_bytes as u32 } else { 0 },
          duration_millis: if r.duration_millis > 0 { r.duration_millis as u32 } else { 0 },
          created_at: r.created_at,
          updated_at: r.updated_at,
        }
      })
      .collect::<Vec<TtsInferenceRecordForList>>();

  Ok(TtsInferenceListPage {
    inference_records: inference_results,
    sort_ascending,
    first_id,
    last_id,
  })
}

async fn list_tts_inference_results_query (
  mysql_pool: &MySqlPool,
  scope_creator_username: Option<&str>,
  sort_ascending: bool,
  cursor_is_previous: bool,
  block_mod_disabled : bool,
  limit: u16,
  offset: Option<u64>,
) -> AnyhowResult<Vec<RawInternalTtsRecord>> {
  info!("listing tts inference results");

  // TODO/NB: Unfortunately SQLx can't statically typecheck this query
  let mut query = r#"
SELECT
    tts_results.id as tts_result_id,
    tts_results.token as tts_result_token,

    tts_results.model_token as tts_model_token,
    tts_results.raw_inference_text as raw_inference_text,

    users.token as maybe_creator_user_token,
    users.username as maybe_creator_username,
    users.display_name as maybe_creator_display_name,

    tts_results.file_size_bytes,
    tts_results.duration_millis,
    tts_results.created_at,
    tts_results.updated_at

FROM tts_results
LEFT OUTER JOIN tts_models
    ON tts_results.model_token = tts_models.token
LEFT OUTER JOIN users
    ON tts_results.maybe_creator_user_token = users.token
  "#.to_string();

  let mut sort_ascending = sort_ascending; // NB: We may need to change the direction.
  let mut reverse_results = false;

  let mut first_predicate_added = false;

  if let Some(offset) = offset {
    if !first_predicate_added {
      query.push_str(" WHERE ");
      first_predicate_added = true;
    } else {
      query.push_str(" AND ");
    }

    // TODO: Cleanup, builder class, tests.

    if sort_ascending {
      if cursor_is_previous {
        // NB: We're searching backwards.
        query.push_str(" tts_results.id < ? ");
        sort_ascending = !sort_ascending;
        reverse_results = true;
      } else {
        query.push_str(" tts_results.id > ? ");
      }
    } else {
      if cursor_is_previous {
        // NB: We're searching backwards.
        query.push_str(" tts_results.id > ? ");
        sort_ascending = !sort_ascending;
        reverse_results = true;
      } else {
        query.push_str(" tts_results.id < ? ");
      }
    }
  }

  if let Some(username) = scope_creator_username {
    if !first_predicate_added {
      query.push_str(r#" WHERE users.username = ? "#);
      first_predicate_added = true;
    } else {
      query.push_str(r#" AND users.username = ? "#);
    }
  }

  if block_mod_disabled {
    if !first_predicate_added {
      query.push_str(r#"
        WHERE tts_results.user_deleted_at IS NULL
        AND tts_results.mod_deleted_at IS NULL
      "#);
      first_predicate_added = true;
    } else {
      query.push_str(r#"
        AND tts_results.user_deleted_at IS NULL
        AND tts_results.mod_deleted_at IS NULL
      "#);
    }
  }

  if sort_ascending {
    query.push_str(" ORDER BY tts_results.id ASC ");
  } else {
    query.push_str(" ORDER BY tts_results.id DESC ");
  }

  query.push_str(" LIMIT ? ");

  let mut query = sqlx::query_as::<_, RawInternalTtsRecord>(&query);

  if let Some(offset) = offset {
    query = query.bind(offset);
  }

  if let Some(username) = scope_creator_username {
    query = query.bind(username);
  }

  query = query.bind(limit);

  let mut results = query.fetch_all(mysql_pool)
      .await?;

  if reverse_results {
    results.reverse()
  }

  Ok(results)
}

/// These are very difficult queries, so this helps.
pub struct QueryBuilder {
  scope_creator_username: Option<String>,
  include_mod_disabled_results: bool,
  sort_ascending: bool,
  offset: Option<u64>,
  limit: u16,
  cursor_is_reversed: bool,
  result_set_requires_reverse_sort: bool,
}

impl QueryBuilder {
  pub fn new() -> Self {
    Self {
      scope_creator_username: None,
      include_mod_disabled_results: false,
      sort_ascending: false,
      offset: None,
      limit: 5,
      cursor_is_reversed: false,
      result_set_requires_reverse_sort: false,
    }
  }

  pub fn scope_creator_username(mut self, scope_creator_username: Option<&str>) -> Self {
    self.scope_creator_username = scope_creator_username.map(|u| u.to_string());
    self
  }

  pub fn include_mod_disabled_results(mut self, include_mod_disabled_results: bool) -> Self {
    self.include_mod_disabled_results = include_mod_disabled_results;
    self
  }

  pub fn sort_ascending(mut self, sort_ascending: bool) -> Self {
    self.sort_ascending = sort_ascending;
    self
  }

  pub fn offset(mut self, offset: Option<u64>) -> Self {
    self.offset = offset;
    self
  }

  pub fn limit(mut self, limit: u16) -> Self {
    self.limit = limit;
    self
  }

  pub fn cursor_is_reversed(mut self, cursor_is_reversed: bool) -> Self {
    self.cursor_is_reversed = cursor_is_reversed;
    self
  }

  pub fn build_predicates(&self) -> String {
    // NB: Reverse cursors require us to invert the sort direction.
    let mut sort_ascending = self.sort_ascending;
    // NB: If the sort direction is artificially reversed, we'll restore the result order.
    let mut reverse_results = false;

    let mut first_predicate_added = false;

    let mut query = "".to_string();

    if let Some(offset) = self.offset {
      if !first_predicate_added {
        query.push_str(" WHERE");
        first_predicate_added = true;
      } else {
        query.push_str(" AND");
      }

      if sort_ascending {
        if self.cursor_is_reversed {
          // NB: We're searching backwards.
          query.push_str(" tts_results.id < ?");
          sort_ascending = !sort_ascending;
          reverse_results = true;
        } else {
          query.push_str(" tts_results.id > ?");
        }
      } else {
        if self.cursor_is_reversed {
          // NB: We're searching backwards.
          query.push_str(" tts_results.id > ?");
          sort_ascending = !sort_ascending;
          reverse_results = true;
        } else {
          query.push_str(" tts_results.id < ?");
        }
      }
    }

    if let Some(username) = self.scope_creator_username.as_deref() {
      if !first_predicate_added {
        query.push_str(" WHERE users.username = ?");
        first_predicate_added = true;
      } else {
        query.push_str(" AND users.username = ?");
      }
    }

    if !self.include_mod_disabled_results {
      if !first_predicate_added {
        query.push_str(" WHERE tts_results.user_deleted_at IS NULL");
        query.push_str(" AND tts_results.mod_deleted_at IS NULL");
        first_predicate_added = true;
      } else {
        query.push_str(" AND tts_results.user_deleted_at IS NULL");
        query.push_str(" AND tts_results.mod_deleted_at IS NULL");
      }
    }

    if sort_ascending {
      query.push_str(" ORDER BY tts_results.id ASC");
    } else {
      query.push_str(" ORDER BY tts_results.id DESC");
    }

    query.push_str(" LIMIT ?");

    query
  }
}

#[cfg(test)]
mod tests {
  use crate::common_queries::list_tts_inference_results::QueryBuilder;

  #[test]
  fn predicates_without_scoping() {
    let query_builder = QueryBuilder::new();

    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id DESC \
      LIMIT ?");
  }

  #[test]
  fn predicates_scoped_to_user() {
    let query_builder = QueryBuilder::new()
        .scope_creator_username(Some("echelon"));

    assert_eq!(&query_builder.build_predicates(),
      " WHERE users.username = ? \
      AND tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id DESC \
      LIMIT ?");
  }

  #[test]
  fn predicates_including_deleted() {
    let query_builder = QueryBuilder::new()
        .include_mod_disabled_results(true);

    assert_eq!(&query_builder.build_predicates(),
      " ORDER BY tts_results.id DESC \
      LIMIT ?");
  }

  #[test]
  fn predicates_sort_ascending() {
    let query_builder = QueryBuilder::new()
        .sort_ascending(true);

    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id ASC \
      LIMIT ?");
  }

  #[test]
  fn predicates_offset() {
    let query_builder = QueryBuilder::new()
        .offset(Some(100));

    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.id < ? \
      AND tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id DESC \
      LIMIT ?");
  }

  #[test]
  fn predicates_offset_and_sort_ascending() {
    let query_builder = QueryBuilder::new()
        .sort_ascending(true)
        .offset(Some(100));

    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.id > ? \
      AND tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id ASC \
      LIMIT ?");
  }

  #[test]
  fn predicates_limit() {
    let query_builder = QueryBuilder::new()
        .limit(15);

    // NB: Does not change the query itself! Just the downstream binding.
    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id DESC \
      LIMIT ?");
  }

  #[test]
  fn predicates_cursor_is_reversed_without_cursor() {
    let query_builder = QueryBuilder::new()
        .cursor_is_reversed(true);

    // NB: Without a cursor, nothing happens.
    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id DESC \
      LIMIT ?");
  }

  #[test]
  fn predicates_offset_cursor_is_reversed() {
    let query_builder = QueryBuilder::new()
        .offset(Some(100))
        .cursor_is_reversed(true);

    // NB: This will change the sort order and greater/less than direction!
    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.id > ? \
      AND tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id ASC \
      LIMIT ?");
  }


  #[test]
  fn predicates_offset_cursor_is_reversed_sort_ascending() {
    let query_builder = QueryBuilder::new()
        .offset(Some(100))
        .cursor_is_reversed(true)
        .sort_ascending(true);

    // NB: This will change the sort order and greater/less than direction!
    assert_eq!(&query_builder.build_predicates(),
      " WHERE tts_results.id < ? \
      AND tts_results.user_deleted_at IS NULL \
      AND tts_results.mod_deleted_at IS NULL \
      ORDER BY tts_results.id DESC \
      LIMIT ?");
  }
}
