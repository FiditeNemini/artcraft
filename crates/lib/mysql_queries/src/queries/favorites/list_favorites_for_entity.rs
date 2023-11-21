use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::warn;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::favorites::FavoriteToken;
use tokens::tokens::users::UserToken;

use crate::queries::favorites::favorite_entity_token::FavoriteEntityToken;

pub struct Favorite {
  pub token: FavoriteToken,

  pub user_token: UserToken,
  pub username: String,
  pub user_display_name: String,
  pub user_gravatar_hash: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub maybe_deleted_at: Option<DateTime<Utc>>,
}

pub async fn list_favorites_for_entity(
  favorite_entity_token: FavoriteEntityToken,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Vec<Favorite>> {

  let (entity_type, entity_token) = favorite_entity_token.get_composite_keys();

  let maybe_results= sqlx::query_as!(
      RawFavoriteRecord,
        r#"
SELECT
    f.token as `token: tokens::tokens::favorites::FavoriteToken`,
    f.user_token as `user_token: tokens::tokens::users::UserToken`,
    u.username,
    u.display_name as user_display_name,
    u.email_gravatar_hash as user_gravatar_hash,

    f.created_at,
    f.updated_at,
    f.deleted_at

FROM
    favorites AS f
JOIN users AS u
    ON f.user_token = u.token
WHERE
    f.entity_type = ?
    AND f.entity_token = ?
    AND f.deleted_at IS NULL
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
        warn!("list favorites db error: {:?}", err);
        Err(anyhow!("error with query: {:?}", err))
      }
    },
    Ok(results) => Ok(results.into_iter()
        .map(|favorite| favorite.into_public_type())
        .collect()),
  }
}

pub struct RawFavoriteRecord {
  token: FavoriteToken,

  user_token: UserToken,
  username: String,
  user_display_name: String,
  user_gravatar_hash: String,

  created_at: DateTime<Utc>,
  updated_at: DateTime<Utc>,
  deleted_at: Option<DateTime<Utc>>,
}

impl RawFavoriteRecord {
  pub fn into_public_type(self) -> Favorite {
    Favorite {
      token: self.token,
      user_token: self.user_token,
      username: self.username,
      user_display_name: self.user_display_name,
      user_gravatar_hash: self.user_gravatar_hash,
      created_at: self.created_at,
      updated_at: self.updated_at,
      maybe_deleted_at: self.deleted_at,
    }
  }
}
