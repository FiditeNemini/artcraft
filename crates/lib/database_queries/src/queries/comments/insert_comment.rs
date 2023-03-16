use anyhow::anyhow;
use chrono::Utc;
use crate::queries::comments::comment_entity_token::CommentEntityToken;
use enums::by_table::comments::comment_entity_type::CommentEntityType;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use sqlx::MySqlPool;
use std::path::Path;
use tokens::tokens::comments::CommentToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::users::user::UserToken;
use tokens::voice_conversion::model::VoiceConversionModelToken;

pub struct Args<'a> {
  pub entity_token: &'a CommentEntityToken,

  pub uuid_idempotency_token: &'a str,

  pub user_token: Option<&'a UserToken>,

  pub comment_markdown: &'a str,
  pub comment_rendered_html: &'a str,

  pub creator_ip_address: &'a str,

  pub mysql_pool: &'a MySqlPool,
}


pub async fn insert_comment(
  args: Args<'_>,
) -> AnyhowResult<CommentToken> {

  let comment_token = CommentToken::generate();
  let (entity_type, entity_token) = args.entity_token.get_composite_keys();

  let query_result = sqlx::query!(
        r#"
INSERT INTO comments
SET
  token = ?,
  uuid_idempotency_token = ?,
  user_token = ?,
  entity_type = ?,
  entity_token = ?,
  comment_markdown = ?,
  comment_rendered_html = ?,
  creator_ip_address = ?
        "#,
      &comment_token,
      args.uuid_idempotency_token,
      args.user_token,
      entity_type,
      entity_token,
      args.comment_markdown,
      args.comment_rendered_html,
      args.creator_ip_address,
    )
      .execute(args.mysql_pool)
      .await;

  let _record_id = match query_result {
    Ok(res) => res.last_insert_id(),
    Err(err) => return Err(anyhow!("Mysql error: {:?}", err)),
  };

  Ok(comment_token)
}
