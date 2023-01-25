use container_common::anyhow_result::AnyhowResult;
use crate::composite_keys::by_table::user_ratings::user_rating_entity::UserRatingEntity;
use enums::by_table::user_ratings::entity_type::UserRatingEntityType;
use enums::by_table::user_ratings::rating_value::UserRatingValue;
use sqlx::MySql;
use sqlx::pool::PoolConnection;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::users::user::UserToken;

pub struct Args<'a> {
  pub user_token: &'a UserToken,
  pub user_rating_entity: &'a UserRatingEntity,
  pub user_rating_value: UserRatingValue,
  pub ip_address: &'a str,
  pub mysql_connection: &'a mut PoolConnection<MySql>,
}

pub async fn upsert_user_rating(args: Args<'_>) -> AnyhowResult<()> {
  let entity_type = args.user_rating_entity.get_entity_type();
  let entity_token = args.user_rating_entity.get_entity_token_str();

  let query = sqlx::query!(
        r#"
INSERT INTO user_ratings
SET
  user_token = ?,
  entity_type = ?,
  entity_token = ?,
  rating_value = ?,
  vote_ip_address = ?,
  version = 1

ON DUPLICATE KEY UPDATE
  rating_value = ?,
  vote_ip_address = ?,
  version = version + 1
        "#,
      // Insert
      args.user_token.as_str(),
      entity_type,
      entity_token,
      args.user_rating_value.to_str(),
      args.ip_address,
      args.user_rating_value.to_str(),
      args.ip_address
    );

  let _r = query.execute(args.mysql_connection).await?;
  Ok(())
}
