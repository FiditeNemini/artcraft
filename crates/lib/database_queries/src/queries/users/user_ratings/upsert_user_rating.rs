use container_common::anyhow_result::AnyhowResult;
use enums::by_table::user_ratings::entity_type::UserRatingEntityType;
use sqlx::MySql;
use sqlx::pool::PoolConnection;
use enums::by_table::user_ratings::rating_type::UserRatingType;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::users::user::UserToken;

pub enum UserRatingEntityToken<'a> {
  TtsModel(&'a TtsModelToken),
  W2lTemplate(&'a W2lTemplateToken),
}

pub struct Args<'a> {
  pub user_token: &'a UserToken,
  pub entity_token: UserRatingEntityToken<'a>,
  pub rating_type: UserRatingType,
  pub ip_address: &'a str,
  pub mysql_connection: &'a mut PoolConnection<MySql>,
}

pub async fn upsert_user_rating(args: Args<'_>) -> AnyhowResult<()> {

  let (entity_type, entity_token) = match args.entity_token {
    EntityToken::TtsModel(token) => (UserRatingEntityType::TtsModel, token.as_str()),
    EntityToken::W2lTemplate(token) => (UserRatingEntityType::W2lTemplate, token.as_str()),
  };

  let query = sqlx::query!(
        r#"
INSERT INTO user_ratings
SET
  user_token = ?,
  entity_type = ?,
  entity_token = ?,
  rating_type = ?,
  vote_ip_address = ?,
  version = 1

ON DUPLICATE KEY UPDATE
  rating_type = ?,
  vote_ip_address = ?,
  version = version + 1
        "#,
      // Insert
      args.user_token.as_str(),
      entity_type,
      entity_token,
      args.rating_type.to_str(),
      args.ip_address,
      args.rating_type.to_str(),
      args.ip_address
    );

  let _r = query.execute(args.mysql_connection).await?;
  Ok(())
}
