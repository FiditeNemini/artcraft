use anyhow::anyhow;
use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::w2l_template_upload_jobs::W2lTemplateUploadJobToken;

pub struct InsertW2lTemplateUploadJobArgs<'a> {
  pub uuid: &'a str,
  pub creator_user_token: &'a str,
  pub creator_ip_address: &'a str,
  pub creator_set_visibility: &'a str,
  pub title: &'a str,
  pub template_type: &'a str,
  pub download_url: &'a str,
  pub mysql_pool: &'a MySqlPool,
}

// NB: Returns the new token
pub async fn insert_w2l_template_upload_job(args: InsertW2lTemplateUploadJobArgs<'_>) -> AnyhowResult<String> {
  // This token is returned to the client.
  let job_token = W2lTemplateUploadJobToken::generate().to_string();

  let query_result = sqlx::query!(
        r#"
INSERT INTO w2l_template_upload_jobs
SET
  token = ?,
  uuid_idempotency_token = ?,
  creator_user_token = ?,
  creator_ip_address = ?,
  creator_set_visibility = ?,
  title = ?,
  template_type = ?,
  download_url = ?,
  status = "pending"
        "#,
        &job_token,
        args.uuid.to_string(),
        args.creator_user_token.to_string(),
        args.creator_ip_address.to_string(),
        args.creator_set_visibility.to_string(),
        args.title.to_string(),
        args.template_type,
        args.download_url,
    )
      .execute(args.mysql_pool)
      .await;

  let _record_id = match query_result {
    Ok(res) => res.last_insert_id(),
    Err(err) => {
      return Err(anyhow!("failure to create w2l template upload job: {:?}", err));
    }
  };

  Ok(job_token)
}
