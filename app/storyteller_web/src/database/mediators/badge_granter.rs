use anyhow::anyhow;
use crate::database::helpers::tokens::Tokens;
use crate::database::mediators::firehose_publisher::FirehosePublisher;
use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use log::{warn,info};
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlDone;
use sqlx::{MySqlPool};
use std::sync::Arc;

#[derive(Debug, Clone, Copy)]
pub enum UserBadge {
  // Granted for early vocodes users.
  EarlyUser,

  // Granted for uploading models
  TtsModelUploader1,
  TtsModelUploader5,
  TtsModelUploader10,
  TtsModelUploader20,
  TtsModelUploader50,
  TtsModelUploader100,
  TtsModelUploader150,
  TtsModelUploader200,
  TtsModelUploader250,

  // Granted for uploading templates
  W2lTemplateUploader1,
  W2lTemplateUploader10,
  W2lTemplateUploader50,
  W2lTemplateUploader100,
  W2lTemplateUploader200,
  W2lTemplateUploader500,
  W2lTemplateUploader1000,
  W2lTemplateUploader2000,
  W2lTemplateUploader5000,
  W2lTemplateUploader10000,

  //// Granted for using models
  //TtsInferenceUser100,
  //TtsInferenceUser500,
  //TtsInferenceUser1000,
  //TtsInferenceUser10000,
  //TtsInferenceUser100000,

  //// Granted for using templates
  //W2lInferenceUser100,
  //W2lInferenceUser500,
  //W2lInferenceUser1000,
  //W2lInferenceUser10000,
  //W2lInferenceUser100000,
}

impl UserBadge {
  pub fn to_db_value(&self) -> &'static str {
    match self {
      UserBadge::EarlyUser => "early_user",
      UserBadge::TtsModelUploader1 => "tts_model_uploader_1",
      UserBadge::TtsModelUploader5 => "tts_model_uploader_5",
      UserBadge::TtsModelUploader10 => "tts_model_uploader_10",
      UserBadge::TtsModelUploader20 => "tts_model_uploader_20",
      UserBadge::TtsModelUploader50 => "tts_model_uploader_50",
      UserBadge::TtsModelUploader100 => "tts_model_uploader_100",
      UserBadge::TtsModelUploader150 => "tts_model_uploader_150",
      UserBadge::TtsModelUploader200 => "tts_model_uploader_200",
      UserBadge::TtsModelUploader250 => "tts_model_uploader_250",
      UserBadge::W2lTemplateUploader1 => "w2l_template_uploader_1",
      UserBadge::W2lTemplateUploader10 => "w2l_template_uploader_10",
      UserBadge::W2lTemplateUploader50 => "w2l_template_uploader_50",
      UserBadge::W2lTemplateUploader100 => "w2l_template_uploader_100",
      UserBadge::W2lTemplateUploader200 => "w2l_template_uploader_200",
      UserBadge::W2lTemplateUploader500 => "w2l_template_uploader_500",
      UserBadge::W2lTemplateUploader1000 => "w2l_template_uploader_1000",
      UserBadge::W2lTemplateUploader2000 => "w2l_template_uploader_2000",
      UserBadge::W2lTemplateUploader5000 => "w2l_template_uploader_5000",
      UserBadge::W2lTemplateUploader10000 => "w2l_template_uploader_10000",
      //UserBadge::TtsInferenceUser100 => "tts_inference_100",
      //UserBadge::TtsInferenceUser500 => "tts_inference_500",
      //UserBadge::TtsInferenceUser1000 => "tts_inference_1000",
      //UserBadge::TtsInferenceUser10000 =>"tts_inference_10000",
      //UserBadge::TtsInferenceUser100000 => "tts_inference_100000",
      //UserBadge::W2lInferenceUser100 => "w2l_inference_100",
      //UserBadge::W2lInferenceUser500 => "w2l_inference_500",
      //UserBadge::W2lInferenceUser1000 => "w2l_inference_1000",
      //UserBadge::W2lInferenceUser10000 => "w2l_inference_10000",
      //UserBadge::W2lInferenceUser100000 => "w2l_inference_100000",
    }
  }
}

#[derive(Clone)]
pub struct BadgeGranter {
  pub mysql_pool: MySqlPool,
  pub firehose_publisher: FirehosePublisher, // NB: Type is Copy/Clone safe due to internal Arc.
}

struct ExistenceRecord {
  pub does_exist: i64,
}

struct CountRecord {
  pub count: i64,
}

impl BadgeGranter {

  pub async fn grant_early_user_badge(&self, user_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      UserBadge::EarlyUser,
      user_token,
    ).await?;
    Ok(())
  }

  /// This needs to be called *after* successful upload.
  pub async fn maybe_grant_tts_model_uploads_badge(&self, user_token: &str) -> AnyhowResult<()> {
    let count = self.count_tts_models_uploaded(user_token).await?;

    let mut maybe_badge = None;

    if count >= 250 {
      maybe_badge = Some(UserBadge::TtsModelUploader250);
    } else if count >= 200 {
      maybe_badge = Some(UserBadge::TtsModelUploader200);
    } else if count >= 150 {
      maybe_badge = Some(UserBadge::TtsModelUploader150);
    } else if count >= 100 {
      maybe_badge = Some(UserBadge::TtsModelUploader100);
    } else if count >= 50 {
      maybe_badge = Some(UserBadge::TtsModelUploader50);
    } else if count >= 20 {
      maybe_badge = Some(UserBadge::TtsModelUploader20);
    } else if count >= 10 {
      maybe_badge = Some(UserBadge::TtsModelUploader10);
    } else if count >= 5 {
      maybe_badge = Some(UserBadge::TtsModelUploader5);
    } else if count >= 1 {
      maybe_badge = Some(UserBadge::TtsModelUploader1);
    }

    let badge = match maybe_badge {
      Some(badge) => badge,
      None => return Ok(()),
    };

    if self.has_badge(user_token, badge).await? {
      return Ok(())
    }

    let _record_id = self.insert(
      badge,
      user_token,
    ).await?;

    self.firehose_publisher.publish_user_badge_granted(user_token, badge.to_db_value())
        .await?;

    Ok(())
  }


  /// This needs to be called *after* successful upload.
  pub async fn maybe_grant_w2l_template_uploads_badge(&self, user_token: &str) -> AnyhowResult<()> {
    let count = self.count_w2l_templates_uploaded(user_token).await?;

    let mut maybe_badge = None;

    if count >= 10000 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader10000);
    } else if count >= 5000 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader5000);
    } else if count >= 2000 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader2000);
    } else if count >= 1000 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader1000);
    } else if count >= 500 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader500);
    } else if count >= 200 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader200);
    } else if count >= 100 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader100);
    } else if count >= 50 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader50);
    } else if count >= 10 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader10);
    } else if count >= 1 {
      maybe_badge = Some(UserBadge::W2lTemplateUploader1);
    }

    let badge = match maybe_badge {
      Some(badge) => badge,
      None => return Ok(()),
    };

    if self.has_badge(user_token, badge).await? {
      return Ok(())
    }

    let _record_id = self.insert(
      badge,
      user_token,
    ).await?;

    self.firehose_publisher.publish_user_badge_granted(user_token, badge.to_db_value())
        .await?;

    Ok(())
  }


  // =======================================================================

  pub async fn has_badge(&self, user_token: &str, user_badge: UserBadge) -> AnyhowResult<bool> {
    let maybe_result = sqlx::query_as!(
      ExistenceRecord,
        r#"
SELECT 1 as does_exist
FROM user_badges
WHERE
  user_token = ?
AND
  badge_slug = ?
LIMIT 1
        "#,
      user_token,
      user_badge.to_db_value()
    )
        .fetch_one(&self.mysql_pool)
        .await;

    let exists = match maybe_result {
      Ok(_record) => true,
      Err(err) => {
        match err {
          RowNotFound => false,
          _ => {
            warn!("query error: {:?}", err);
            return Err(anyhow!("error querying: {:?}", err));
          }
        }
      }
    };

    Ok(exists)
  }

  // =======================================================================

  async fn count_tts_models_uploaded(
    &self,
    user_token: &str,
  ) -> AnyhowResult<u64> {
    // NB: This could get expensive!
    let maybe_result = sqlx::query_as!(
      CountRecord,
        r#"
SELECT count(*) as count
FROM tts_models
WHERE
  creator_user_token = ?
LIMIT 1
        "#,
      user_token
    )
        .fetch_one(&self.mysql_pool)
        .await;

    self.handle_count_query(maybe_result)
  }

  async fn count_w2l_templates_uploaded(
    &self,
    user_token: &str,
  ) -> AnyhowResult<u64> {
    // NB: This could get expensive!
    // Especially at the scale we'll likely have W2L templates.
    let maybe_result = sqlx::query_as!(
      CountRecord,
        r#"
SELECT count(*) as count
FROM w2l_templates
WHERE
  creator_user_token = ?
LIMIT 1
        "#,
      user_token
    )
        .fetch_one(&self.mysql_pool)
        .await;

    self.handle_count_query(maybe_result)
  }

  async fn insert(
    &self,
    user_badge: UserBadge,
    user_token: &str,
  ) -> AnyhowResult<u64> {
    let query_result = sqlx::query!(
        r#"
INSERT INTO user_badges
SET
  user_token = ?,
  badge_slug = ?
        "#,
      user_token,
      user_badge.to_db_value(),
    )
        .execute(&self.mysql_pool)
        .await;

    let record_id = Self::handle_results(query_result)?;
    Ok(record_id)
  }

  fn handle_results(query_result: Result<MySqlDone, sqlx::Error>) -> AnyhowResult<u64> {
    let record_id = match query_result {
      Ok(res) => {
        res.last_insert_id()
      },
      Err(err) => {
        warn!("Insert badge record DB error: {:?}", err);

        // NB: SQLSTATE[23000]: Integrity constraint violation
        // NB: MySQL Error Code 1062: Duplicate key insertion (this is harder to access)
        match err {
          Database(err) => {
            let maybe_code = err.code().map(|c| c.into_owned());
            /*match maybe_code.as_deref() {
              Some("23000") => {
                if err.message().contains("username") {
                  return Err(UsernameTaken);
                } else if err.message().contains("email_address") {
                  return Err(EmailTaken);
                }
              }
              _ => {},
            }*/
          },
          _ => {},
        }
        return Err(anyhow!("Error inserting record"));
      }
    };

    Ok(record_id)
  }

  fn handle_count_query(&self, query_result: Result<CountRecord, sqlx::Error>) -> AnyhowResult<u64> {
    let count = match query_result {
      Ok(record) => record.count as u64,
      Err(err) => {
        match err {
          RowNotFound => 0,
          _ => {
            warn!("query error: {:?}", err);
            return Err(anyhow!("error querying: {:?}", err));
          }
        }
      }
    };

    Ok(count)
  }
}
