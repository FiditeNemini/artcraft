//! Audit logs are for entities that can be *edited* where we might lose the IP / edit history.

use anyhow::anyhow;
use sqlx::MySqlPool;

use enums::by_table::audit_logs::audit_log_entity_action::AuditLogEntityAction;
use enums::by_table::audit_logs::audit_log_entity_type::AuditLogEntityType;
use errors::AnyhowResult;
use tokens::tokens::audit_logs::AuditLogToken;
use tokens::tokens::comments::CommentToken;
use tokens::tokens::tts_models::TtsModelToken;
use tokens::tokens::w2l_templates::W2lTemplateToken;
use tokens::tokens::users::UserToken;

pub enum AuditLogEntityToken {
  Comment(CommentToken),
  TtsModel(TtsModelToken),
  TtsResult(String), // TODO: Strong type
  W2lTemplate(W2lTemplateToken),
  W2lResult(String), // TODO: Strong type
}

pub struct Args<'a> {
  pub entity_token: &'a AuditLogEntityToken,
  pub entity_action: AuditLogEntityAction,

  pub maybe_actor_user_token: Option<&'a UserToken>,
  pub actor_ip_address: &'a str,
  pub is_actor_moderator: bool,

  pub mysql_pool: &'a MySqlPool,
}


pub async fn insert_audit_log(
  args: Args<'_>,
) -> AnyhowResult<AuditLogToken> {

  let audit_log_token = AuditLogToken::generate();

  let (entity_type, entity_token) = match args.entity_token {
    AuditLogEntityToken::Comment(comment_token) => (AuditLogEntityType::Comment, comment_token.as_str()),
    AuditLogEntityToken::TtsModel(tts_model_token) => (AuditLogEntityType::TtsModel, tts_model_token.as_str()),
    AuditLogEntityToken::TtsResult(tts_result_token) => (AuditLogEntityType::TtsResult, tts_result_token.as_str()),
    AuditLogEntityToken::W2lTemplate(w2l_template_token) => (AuditLogEntityType::W2lTemplate, w2l_template_token.as_str()),
    AuditLogEntityToken::W2lResult(w2l_result_token) => (AuditLogEntityType::W2lResult, w2l_result_token.as_str()),
  };

  let query_result = sqlx::query!(
        r#"
INSERT INTO audit_logs
SET
  token = ?,
  entity_type = ?,
  entity_token = ?,
  entity_action = ?,
  maybe_actor_user_token = ?,
  maybe_actor_anonymous_visitor_token = '',
  is_actor_moderator = ?,
  actor_ip_address = ?
        "#,
      &audit_log_token,
      entity_type,
      entity_token,
      args.entity_action,
      args.maybe_actor_user_token,
      args.is_actor_moderator,
      args.actor_ip_address,
    )
      .execute(args.mysql_pool)
      .await;

  let _record_id = match query_result {
    Ok(res) => res.last_insert_id(),
    Err(err) => return Err(anyhow!("Mysql error: {:?}", err)),
  };

  Ok(audit_log_token)
}
