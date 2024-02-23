use std::marker::PhantomData;

use sqlx;
use sqlx::{Executor, MySql};

use enums::by_table::prompts::prompt_type::PromptType;
use errors::AnyhowResult;
use tokens::tokens::prompts::PromptToken;
use tokens::tokens::users::UserToken;

pub struct InsertArgs<'e, 'c,  E>
  where E: 'e + Executor<'c, Database = MySql>
{
  /// If we need to generate the prompt token upfront, this will be the token to use for the insert.
  pub maybe_apriori_prompt_token: Option<&'e PromptToken>,

  pub prompt_type: PromptType,

  pub maybe_creator_user_token: Option<&'e UserToken>,

  pub maybe_positive_prompt: Option<&'e str>,

  pub maybe_negative_prompt: Option<&'e str>,

  // TODO(bt,2024-02-22): This needs to be its own JSON serializable type.
  pub maybe_other_args: Option<&'e str>,

  pub creator_ip_address: &'e str,

  pub mysql_executor: E,

  // TODO: Not sure if this works to tell the compiler we need the lifetime annotation.
  //  See: https://doc.rust-lang.org/std/marker/struct.PhantomData.html#unused-lifetime-parameters
  pub phantom: PhantomData<&'c E>,
}

pub async fn insert_prompt<'e, 'c : 'e, E>(args: InsertArgs<'e, 'c, E>)
  -> AnyhowResult<PromptToken>
  where E: 'e + Executor<'c, Database = MySql>
{
  let prompt_token = match args.maybe_apriori_prompt_token {
    Some(token) => token.clone(),
    None => PromptToken::generate(),
  };

  let query = sqlx::query!(
      r#"
INSERT INTO prompts
SET
  token = ?,
  prompt_type = ?,

  maybe_creator_user_token = ?,

  maybe_positive_prompt = ?,
  maybe_negative_prompt = ?,
  maybe_other_args = ?,

  creator_ip_address = ?
        "#,
    prompt_token.as_str(),
    args.prompt_type.to_str(),
    args.maybe_creator_user_token.map(|t| t.as_str()),
    args.maybe_positive_prompt,
    args.maybe_negative_prompt,
    args.maybe_other_args,
    args.creator_ip_address,
  );

  let _result = query.execute(args.mysql_executor).await?;

  Ok(prompt_token)
}
