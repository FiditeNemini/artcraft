use chrono::{DateTime, Utc};
use sqlx::{FromRow, MySql, MySqlPool, QueryBuilder, Row};
use sqlx::mysql::MySqlRow;

use enums::by_table::beta_keys::beta_key_product::BetaKeyProduct;
use enums::traits::mysql_from_row::MySqlFromRow;
use errors::AnyhowResult;
use tokens::tokens::beta_keys::BetaKeyToken;
use tokens::tokens::users::UserToken;

pub struct BetaKeyListPage {
  pub records: Vec<BetaKeyListItem>,

  pub sort_ascending: bool,

  /// ID of the first record in the result set.
  pub first_id: Option<i64>,

  /// ID of the last record in the result set.
  pub last_id: Option<i64>,
}

pub struct BetaKeyListItem {
  pub token: BetaKeyToken,

  pub product: BetaKeyProduct,
  pub key_value: String,

  pub maybe_referrer_user_token: Option<UserToken>,
  pub maybe_referrer_username: Option<String>,
  pub maybe_referrer_display_name: Option<String>,
  pub maybe_referrer_gravatar_hash: Option<String>,

  pub maybe_redeemer_user_token: Option<UserToken>,
  pub maybe_redeemer_username: Option<String>,
  pub maybe_redeemer_display_name: Option<String>,
  pub maybe_redeemer_gravatar_hash: Option<String>,

  pub created_at: DateTime<Utc>,
  pub maybe_redeemed_at: Option<DateTime<Utc>>,
}

pub struct ListBetaKeysArgs<'a> {
  pub filter_to_referrer_user_token: Option<&'a UserToken>,
  pub filter_to_remaining_keys: bool,
  pub limit: usize,
  pub maybe_offset: Option<usize>,
  pub cursor_is_reversed: bool,
  pub sort_ascending: bool,
  pub mysql_pool: &'a MySqlPool,
}

pub async fn list_beta_keys(args: ListBetaKeysArgs<'_>) -> AnyhowResult<BetaKeyListPage> {

  let mut query = query_builder(
    args.filter_to_referrer_user_token,
    args.filter_to_remaining_keys,
    args.limit,
    args.maybe_offset,
    args.cursor_is_reversed,
    args.sort_ascending,
  );

  let query = query.build_query_as::<MediaFileListItemInternal>();

  let results = query.fetch_all(args.mysql_pool).await?;

  let first_id = results.first()
      .map(|raw_result| raw_result.id);

  let last_id = results.last()
      .map(|raw_result| raw_result.id);

  let results = results.into_iter()
      .map(|record| {
        BetaKeyListItem {
          token: record.token,
          product: record.product,
          key_value: record.key_value,
          maybe_referrer_user_token: record.maybe_referrer_user_token,
          maybe_referrer_username: record.maybe_referrer_username,
          maybe_referrer_display_name: record.maybe_referrer_display_name,
          maybe_referrer_gravatar_hash: record.maybe_referrer_gravatar_hash,
          maybe_redeemer_user_token: record.maybe_redeemer_user_token,
          maybe_redeemer_username: record.maybe_redeemer_username,
          maybe_redeemer_display_name: record.maybe_redeemer_display_name,
          maybe_redeemer_gravatar_hash: record.maybe_redeemer_gravatar_hash,
          created_at: record.created_at,
          maybe_redeemed_at: record.maybe_redeemed_at,
        }
      })
      .collect::<Vec<_>>();

  Ok(BetaKeyListPage {
    records: results,
    sort_ascending: !args.cursor_is_reversed,
    first_id,
    last_id,
  })
}

fn query_builder<'a>(
  filter_to_referrer_user_token: Option<&'a UserToken>,
  filter_to_remaining_keys: bool,
  limit: usize,
  maybe_offset: Option<usize>,
  cursor_is_reversed: bool,
  sort_ascending: bool,
) -> QueryBuilder<'a, MySql> {

  let mut sort_ascending = sort_ascending;
  // NB: Query cannot be statically checked by sqlx
  let mut query_builder: QueryBuilder<MySql> = QueryBuilder::new(
    r#"
SELECT
  b.id,
  b.token,

  b.product,
  b.key_value,

  b.maybe_referrer_user_token,
  referrer.username as maybe_referrer_username,
  referrer.display_name as maybe_referrer_display_name,
  referrer.email_gravatar_hash as maybe_referrer_gravatar_hash,

  b.maybe_redeemer_user_token,
  redeemer.username as maybe_redeemer_username,
  redeemer.display_name as maybe_redeemer_display_name,
  redeemer.email_gravatar_hash as maybe_redeemer_gravatar_hash,

  b.created_at,
  b.maybe_redeemed_at

FROM beta_keys AS b

LEFT OUTER JOIN users AS referrer
    ON b.maybe_referrer_user_token = referrer.token

LEFT OUTER JOIN users AS redeemer
    ON b.maybe_redeemer_user_token = redeemer.token
    "#
  );

  let mut first_predicate_added = false;

  if let Some(user_token) = filter_to_referrer_user_token {
    if !first_predicate_added {
      query_builder.push(" WHERE ");
      first_predicate_added = true;
    } else {
      query_builder.push(" AND ");
    }

    query_builder.push(" b.maybe_referrer_user_token = ");
    query_builder.push_bind(user_token.as_str());
  }

  if filter_to_remaining_keys {
    if !first_predicate_added {
      query_builder.push(" WHERE ");
      first_predicate_added = true;
    } else {
      query_builder.push(" AND ");
    }

    query_builder.push(" b.maybe_redeemed_at IS NULL ");
  }

  if let Some(offset) = maybe_offset {
    if !first_predicate_added {
      query_builder.push(" WHERE ");
      first_predicate_added = true;
    } else {
      query_builder.push(" AND ");
    }

    if sort_ascending {
      if cursor_is_reversed {
        // NB: We're searching backwards.
        query_builder.push(" b.id < ");
        sort_ascending = !sort_ascending;
      } else {
        query_builder.push(" b.id > ");
      }
    } else {
      if cursor_is_reversed {
        // NB: We're searching backwards.
        query_builder.push(" b.id > ");
        sort_ascending = !sort_ascending;
      } else {
        query_builder.push(" b.id < ");
      }
    }
    query_builder.push_bind(offset as i64);
  }

  if sort_ascending {
    query_builder.push(" ORDER BY b.id ASC ");
  } else {
    query_builder.push(" ORDER BY b.id DESC ");
  }

  query_builder.push(format!(" LIMIT {limit} "));

  query_builder
}

struct MediaFileListItemInternal {
  id: i64,
  token: BetaKeyToken,

  product: BetaKeyProduct,
  key_value: String,

  maybe_referrer_user_token: Option<UserToken>,
  maybe_referrer_username: Option<String>,
  maybe_referrer_display_name: Option<String>,
  maybe_referrer_gravatar_hash: Option<String>,

  maybe_redeemer_user_token: Option<UserToken>,
  maybe_redeemer_username: Option<String>,
  maybe_redeemer_display_name: Option<String>,
  maybe_redeemer_gravatar_hash: Option<String>,

  created_at: DateTime<Utc>,
  maybe_redeemed_at: Option<DateTime<Utc>>,
}

impl FromRow<'_, MySqlRow> for MediaFileListItemInternal {
  fn from_row(row: &MySqlRow) -> Result<Self, sqlx::Error> {
    let maybe_referrer_user_token : Option<String> = row.try_get("maybe_referrer_user_token")?;
    let maybe_referrer_user_token = maybe_referrer_user_token.map(|user_token| UserToken::new(user_token));

    let maybe_redeemer_user_token : Option<String> = row.try_get("maybe_redeemer_user_token")?;
    let maybe_redeemer_user_token = maybe_redeemer_user_token.map(|user_token| UserToken::new(user_token));

    Ok(Self {
      id: row.try_get("id")?,
      token: BetaKeyToken::new(row.try_get("token")?),
      product: BetaKeyProduct::try_from_mysql_row(row, "product")?,
      key_value: row.try_get("key_value")?,
      maybe_referrer_user_token,
      maybe_referrer_username: row.try_get("maybe_referrer_username")?,
      maybe_referrer_display_name: row.try_get("maybe_referrer_display_name")?,
      maybe_referrer_gravatar_hash: row.try_get("maybe_referrer_gravatar_hash")?,
      maybe_redeemer_user_token,
      maybe_redeemer_username: row.try_get("maybe_redeemer_username")?,
      maybe_redeemer_display_name: row.try_get("maybe_redeemer_display_name")?,
      maybe_redeemer_gravatar_hash: row.try_get("maybe_redeemer_gravatar_hash")?,
      created_at: row.try_get("created_at")?,
      maybe_redeemed_at: row.try_get("maybe_redeemed_at")?,
    })
  }
}
