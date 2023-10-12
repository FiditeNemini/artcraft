use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::warn;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::favorites::FavoriteToken;
use tokens::tokens::users::UserToken;

use crate::queries::favorites::favorite_entity_token::FavoriteEntityToken;

pub struct FavoriteForList {
  pub token: FavoriteToken,

  pub user_token: UserToken,
  pub username: String,
  pub user_display_name: String,
  pub user_gravatar_hash: String,

  pub mod_fields: FavoriteForListModFields,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

pub struct FavoriteForListModFields {
  pub creator_ip_address: String,
  pub maybe_user_deleted_at: Option<DateTime<Utc>>,
  pub maybe_mod_deleted_at: Option<DateTime<Utc>>,
}

pub async fn list_favorites_for_entity(
  favorite_entity_token: FavoriteEntityToken,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Vec<FavoriteForList>> {

  let (entity_type, entity_token) = favorite_entity_token.get_composite_keys();

  let maybe_results= sqlx::query_as!(
      RawFavoriteForList,
        r#"
SELECT
    f.token as `token: tokens::tokens::favorites::FavoriteToken`,
    f.user_token as `user_token: tokens::tokens::users::UserToken`,
    u.username,
    u.display_name as user_display_name,
    u.email_gravatar_hash as user_gravatar_hash,

    f.creator_ip_address,

    f.created_at,
    f.updated_at,
    f.user_deleted_at,
    f.mod_deleted_at

FROM
    favorites AS f
JOIN users AS u
    ON f.user_token = u.token
WHERE
    f.entity_type = ?
    AND f.entity_token = ?
    AND f.user_deleted_at IS NULL
    AND f.mod_deleted_at IS NULL
ORDER BY f.id DESC
LIMIT 50
        "#,
      entity_type,
      entity_token
    )
      .fetch_all(mysql_pool)
      .await;

  match maybe_results {
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(Vec::new()),
      _ => {
        warn!("list ip bans db error: {:?}", err);
        Err(anyhow!("error with query: {:?}", err))
      }
    },
    Ok(results) => Ok(results.into_iter()
        .map(|favorite| FavoriteForList {
          token: favorite.token,
          user_token: favorite.user_token,
          username: favorite.username,
          user_display_name: favorite.user_display_name,
          user_gravatar_hash: favorite.user_gravatar_hash,
          mod_fields: FavoriteForListModFields {
            creator_ip_address: favorite.creator_ip_address,
            maybe_user_deleted_at: favorite.user_deleted_at,
            maybe_mod_deleted_at: favorite.mod_deleted_at,
          },
          created_at: favorite.created_at,
          updated_at: favorite.updated_at,
        })
        .collect()),
  }
}

pub struct RawFavoriteForList {
  pub token: FavoriteToken,

  pub user_token: UserToken,
  pub username: String,
  pub user_display_name: String,
  pub user_gravatar_hash: String,


  pub creator_ip_address: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub user_deleted_at: Option<DateTime<Utc>>,
  pub mod_deleted_at: Option<DateTime<Utc>>,
}
