use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use enums::core::visibility::Visibility;
use reusable_types::db::enums::generic_inference_type::GenericInferenceType;
use sqlx::MySqlPool;
use tokens::jobs::inference::InferenceJobToken;

pub struct Args <'a> {
  pub job_token: &'a InferenceJobToken,
  pub uuid_idempotency_token: &'a str,

  pub inference_type: GenericInferenceType,
  pub maybe_inference_args: Option<String>, // TODO: Enum struct type
  pub maybe_raw_inference_text: Option<String>,
  pub maybe_model_token: Option<String>,

  pub maybe_creator_user_token: Option<&'a str>,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: Visibility,

  pub mysql_pool: &'a MySqlPool,
}

pub async fn insert_generic_inference_job(args: Args<'_>) -> AnyhowResult<u64> {

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

  status = "pending"
        "#,
        args.job_token,
        args.uuid_idempotency_token,

        args.inference_type,
        args.maybe_inference_args,
        args.maybe_raw_inference_text,
        args.maybe_model_token,

        args.maybe_creator_user_token,
        args.creator_ip_address,
        args.creator_set_visibility.to_str(),
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
