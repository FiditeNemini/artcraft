use anyhow::anyhow;
use crate::payloads::generic_inference_args::GenericInferenceArgs;
use enums::common::visibility::Visibility;
use enums::workers::generic_inference_type::GenericInferenceType;
use errors::AnyhowResult;
use sqlx::MySqlPool;
use tokens::jobs::inference::InferenceJobToken;
use tokens::users::user::UserToken;

pub struct Args <'a> {
  pub job_token: &'a InferenceJobToken,
  pub uuid_idempotency_token: &'a str,

  pub inference_type: GenericInferenceType,
  pub maybe_inference_args: Option<GenericInferenceArgs>,
  pub maybe_raw_inference_text: Option<String>,
  pub maybe_model_token: Option<String>,

  pub maybe_creator_user_token: Option<&'a UserToken>,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: Visibility,

  pub priority_level: u8,
  pub is_debug_request: bool,

  pub mysql_pool: &'a MySqlPool,
}

pub async fn insert_generic_inference_job(args: Args<'_>) -> AnyhowResult<u64> {
  let serialized_args_payload = serde_json::ser::to_string(&args.maybe_inference_args)
      .map_err(|_e| anyhow!("could not encode inference args"))?;

  let query = sqlx::query!(
        r#"
INSERT INTO generic_inference_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,

  inference_type = ?,
  maybe_inference_args = ?,
  maybe_raw_inference_text = ?,
  maybe_model_token = ?,

  maybe_creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,

  priority_level = ?,
  is_debug_request = ?,

  status = "pending"
        "#,
        args.job_token.as_str(),
        args.uuid_idempotency_token,

        args.inference_type.to_str(),
        serialized_args_payload,
        args.maybe_raw_inference_text,
        args.maybe_model_token.map(|t| t.to_string()),

        args.maybe_creator_user_token.map(|t| t.to_string()),
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),
        args.priority_level,
        args.is_debug_request,
    );

  let query_result = query.execute(args.mysql_pool)
      .await;

  let record_id = match query_result {
    Ok(res) => {
      res.last_insert_id()
    },
    Err(err) => {
      return Err(anyhow!("error inserting new generic inference job: {:?}", err));
    }
  };

  Ok(record_id)
}
