// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use anyhow::anyhow;
use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use enums::by_table::prompts::prompt_type::PromptType;
use errors::AnyhowResult;
use tokens::tokens::prompts::PromptToken;
use tokens::tokens::users::UserToken;

use crate::payloads::prompt_args::prompt_inner_payload::PromptInnerPayload;

#[derive(Serialize, Debug)]
pub struct Prompt {
  pub token: PromptToken,

  pub prompt_type: PromptType,

  pub maybe_creator_user_token: Option<UserToken>,

  pub maybe_positive_prompt: Option<String>,
  pub maybe_negative_prompt: Option<String>,

  pub maybe_other_args: Option<PromptInnerPayload>,

  /// For moderators only
  pub creator_ip_address: Option<String>,

  pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct PromptRaw {
  pub token: PromptToken,

  pub prompt_type: PromptType,

  pub maybe_creator_user_token: Option<UserToken>,

  pub maybe_positive_prompt: Option<String>,
  pub maybe_negative_prompt: Option<String>,

  pub maybe_other_args: Option<String>,

  /// For moderators only
  pub creator_ip_address: Option<String>,

  pub created_at: DateTime<Utc>,
}

pub async fn get_prompt(
  prompt_token: &PromptToken,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Option<Prompt>> {

  let record = select_record(prompt_token, mysql_pool).await;

  let record = match record {
    Ok(record) => record,
    Err(ref err) => {
      return match err {
        sqlx::Error::RowNotFound => Ok(None),
        _ => Err(anyhow!("database error: {:?}", err)),
      }
    }
  };

  Ok(Some(Prompt {
    token: record.token,
    prompt_type: record.prompt_type,
    maybe_creator_user_token: record.maybe_creator_user_token,
    maybe_positive_prompt: record.maybe_positive_prompt,
    maybe_negative_prompt: record.maybe_negative_prompt,
    maybe_other_args: record.maybe_other_args
        .as_deref()
        .map(|args| PromptInnerPayload::from_json(args))
        .transpose()?,
    creator_ip_address: record.creator_ip_address,
    created_at: record.created_at,
  }))
}

async fn select_record(
  prompt_token: &PromptToken,
  mysql_pool: &MySqlPool
) -> Result<PromptRaw, sqlx::Error> {
  sqlx::query_as!(
      PromptRaw,
        r#"
SELECT
    p.token as `token: tokens::tokens::prompts::PromptToken`,

    p.prompt_type as `prompt_type: enums::by_table::prompts::prompt_type::PromptType`,

    p.maybe_creator_user_token as `maybe_creator_user_token: tokens::tokens::users::UserToken`,

    p.maybe_positive_prompt,
    p.maybe_negative_prompt,
    p.maybe_other_args,

    p.creator_ip_address,
    p.created_at

FROM prompts as p
WHERE
    p.token = ?
        "#,
      prompt_token
    )
      .fetch_one(mysql_pool)
      .await
}
