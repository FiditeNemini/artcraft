use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::{Executor, MySql};

use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use errors::AnyhowResult;
use tokens::tokens::favorites::FavoriteToken;
use tokens::tokens::users::UserToken;

pub struct Favorite {
  pub token: FavoriteToken,

  pub entity_type: FavoriteEntityType,
  pub entity_token: String,

  pub user_token: UserToken,
  pub username: String,
  pub user_display_name: String,
  pub user_gravatar_hash: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub maybe_deleted_at: Option<DateTime<Utc>>,
}

pub async fn get_favorite<'e, 'c, E>(
  favorite_token: &'e FavoriteToken,
  mysql_executor: E
)
  -> AnyhowResult<Option<Favorite>>
  where E: 'e + Executor<'c, Database = MySql>
{

  let maybe_results = sqlx::query_as!(
      RawFavorite,
        r#"
SELECT
    f.token as `token: tokens::tokens::favorites::FavoriteToken`,

    f.entity_type as `entity_type: enums::by_table::favorites::favorite_entity_type::FavoriteEntityType`,
    f.entity_token,

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
    f.token = ?
        "#,
      favorite_token
    )
      .fetch_one(mysql_executor)
      .await;

  match maybe_results {
    Ok(favorite) => Ok(Some(Favorite {
      token: favorite.token,
      entity_type: favorite.entity_type,
      entity_token: favorite.entity_token,
      user_token: favorite.user_token,
      username: favorite.username,
      user_display_name: favorite.user_display_name,
      user_gravatar_hash: favorite.user_gravatar_hash,
      created_at: favorite.created_at,
      updated_at: favorite.updated_at,
      maybe_deleted_at: favorite.deleted_at,
    })),
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(None),
      _ => Err(anyhow!("Error querying for IP ban: {:?}", err)),
    }
  }
}

pub struct RawFavorite {
  pub token: FavoriteToken,

  pub entity_type: FavoriteEntityType,
  pub entity_token: String,

  pub user_token: UserToken,
  pub username: String,
  pub user_display_name: String,
  pub user_gravatar_hash: String,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
  pub deleted_at: Option<DateTime<Utc>>,
}
