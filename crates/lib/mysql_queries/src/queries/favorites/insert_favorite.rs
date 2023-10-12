use std::marker::PhantomData;

use anyhow::anyhow;
use sqlx::{Executor, MySql};

use errors::AnyhowResult;
use tokens::tokens::favorites::FavoriteToken;
use tokens::tokens::users::UserToken;

use crate::queries::favorites::favorite_entity_token::FavoriteEntityToken;

pub struct InsertFavoriteArgs<'e, 'c, E>
  where E: 'e + Executor<'c, Database = MySql>
{
  pub entity_token: &'e FavoriteEntityToken,

  pub uuid_idempotency_token: &'e str,

  pub user_token: &'e UserToken,

  pub creator_ip_address: &'e str,

  pub mysql_executor: E,

  // TODO: Not sure if this works to tell the compiler we need the lifetime annotation.
  //  See: https://doc.rust-lang.org/std/marker/struct.PhantomData.html#unused-lifetime-parameters
  pub phantom: PhantomData<&'c E>,
}

pub async fn insert_favorite<'e, 'c : 'e, E>(
  args: InsertFavoriteArgs<'e, 'c, E>,
)
  -> AnyhowResult<FavoriteToken>
  where E: 'e + Executor<'c, Database = MySql>
{

  let favorite_token = FavoriteToken::generate();
  let (entity_type, entity_token) = args.entity_token.get_composite_keys();

  let query_result = sqlx::query!(
        r#"
INSERT INTO favorites
SET
  token = ?,
  uuid_idempotency_token = ?,
  user_token = ?,
  entity_type = ?,
  entity_token = ?,
  creator_ip_address = ?
        "#,
      &favorite_token,
      args.uuid_idempotency_token,
      args.user_token,
      entity_type,
      entity_token,
      args.creator_ip_address,
    )
      .execute(args.mysql_executor)
      .await;

  let _record_id = match query_result {
    Ok(res) => res.last_insert_id(),
    Err(err) => return Err(anyhow!("Mysql error: {:?}", err)),
  };

  Ok(favorite_token)
}
