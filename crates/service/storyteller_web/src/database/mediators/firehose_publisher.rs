use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use crate::database::helpers::tokens::Tokens;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;
use log::{warn,info};
use sqlx::error::Error::Database;
use sqlx::mysql::MySqlQueryResult;
use sqlx::{MySqlPool};
use std::sync::Arc;

#[derive(Debug, Clone, Copy)]
enum FirehoseEvent {
  UserSignUp,

  // We don't publish for all badges (eg. early user signup)
  UserBadgeGranted,

  TtsModelUploadStarted,
  TtsModelUploadCompleted,
  TtsInferenceStarted,
  TtsInferenceCompleted,

  W2lTemplateUploadStarted,
  W2lTemplateUploadCompleted,
  W2lInferenceStarted,
  W2lInferenceCompleted,

  TwitterMention,
  TwitterRetweet,
  DiscordJoin,
  DiscordMessage,
  TwitchSubscribe,
  TwitchFollow,
}

impl FirehoseEvent {
  pub fn to_db_value(&self) -> &'static str {
    match self {
      FirehoseEvent::UserSignUp => "user_sign_up",
      FirehoseEvent::UserBadgeGranted=> "user_badge_granted",
      FirehoseEvent::TtsModelUploadStarted => "tts_model_upload_started",
      FirehoseEvent::TtsModelUploadCompleted => "tts_model_upload_completed",
      FirehoseEvent::TtsInferenceStarted => "tts_inference_started",
      FirehoseEvent::TtsInferenceCompleted => "tts_inference_completed",
      FirehoseEvent::W2lTemplateUploadStarted => "w2l_template_upload_started",
      FirehoseEvent::W2lTemplateUploadCompleted => "w2l_template_upload_completed",
      FirehoseEvent::W2lInferenceStarted => "w2l_inference_started",
      FirehoseEvent::W2lInferenceCompleted => "w2l_inference_completed",
      FirehoseEvent::TwitterMention => "twitter_mention",
      FirehoseEvent::TwitterRetweet => "twitter_retweet",
      FirehoseEvent::DiscordJoin => "discord_join",
      FirehoseEvent::DiscordMessage => "discord_message",
      FirehoseEvent::TwitchSubscribe => "twitch_subscribe",
      FirehoseEvent::TwitchFollow => "twitch_follow",
    }
  }
}

#[derive(Clone)]
pub struct FirehosePublisher {
  pub mysql_pool: MySqlPool,
}

impl FirehosePublisher {

  pub async fn publish_user_sign_up(&self, user_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
    FirehoseEvent::UserSignUp,
      Some(user_token),
      Some(user_token),
    Some(user_token)
    ).await?;
    Ok(())
  }

  pub async fn publish_user_badge_granted(&self, user_token: &str, badge_slug: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::UserBadgeGranted,
      Some(user_token),
      Some(badge_slug),
      None,
    ).await?;
    Ok(())
  }

  pub async fn enqueue_tts_model_upload(&self, user_token: &str, job_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::TtsModelUploadStarted,
      Some(user_token),
      None,
      Some(job_token)
    ).await?;
    Ok(())
  }

  pub async fn publish_tts_model_upload_finished(&self, user_token: &str, model_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::TtsModelUploadCompleted,
      Some(user_token),
      Some(model_token),
      Some(model_token)
    ).await?;
    Ok(())
  }

  pub async fn enqueue_tts_inference(
    &self,
    maybe_user_token: Option<&str>,
    job_token: &str,
    model_token: &str
  ) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::TtsInferenceStarted,
      maybe_user_token,
      Some(model_token),
      Some(job_token)
    ).await?;
    Ok(())
  }

  pub async fn tts_inference_finished(
    &self,
    maybe_user_token: Option<&str>,
    model_token: &str,
    result_token: &str
  ) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::TtsInferenceCompleted,
      maybe_user_token,
      Some(model_token),
      Some(result_token)
    ).await?;
    Ok(())
  }

  pub async fn enqueue_w2l_template_upload(&self, user_token: &str, job_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::W2lTemplateUploadStarted,
      Some(user_token),
      None,
      Some(job_token)
    ).await?;
    Ok(())
  }

  pub async fn enqueue_w2l_inference(&self, maybe_user_token: Option<&str>, job_token: &str, template_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::W2lInferenceStarted,
      maybe_user_token,
      Some(template_token),
      Some(job_token)
    ).await?;
    Ok(())
  }

  pub async fn publish_w2l_template_upload_finished(&self, user_token: &str, template_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
    FirehoseEvent::W2lTemplateUploadCompleted,
      Some(user_token),
      Some(template_token),
    Some(template_token)
    ).await?;
    Ok(())
  }

  pub async fn w2l_inference_finished(&self, maybe_user_token: Option<&str>, job_token: &str, result_token: &str) -> AnyhowResult<()> {
    let _record_id = self.insert(
      FirehoseEvent::W2lInferenceCompleted,
      maybe_user_token,
      Some(job_token), // TODO: This could be template_token
      Some(result_token)
    ).await?;
    Ok(())
  }

  // =======================================================================

  async fn insert(
    &self,
    event_type: FirehoseEvent,
    user_token: Option<&str>,
    entity_token: Option<&str>,
    created_entity_token: Option<&str>
  ) -> AnyhowResult<u64> {
    let token = Tokens::new_firehose_event()?;

    let query_result = sqlx::query!(
        r#"
INSERT INTO firehose_entries
SET
  token = ?,
  event_type = ?,
  maybe_target_user_token = ?,
  maybe_target_entity_token = ?,
  maybe_created_entity_token = ?
        "#,
      token,
      event_type.to_db_value(),
      user_token,
      entity_token,
      created_entity_token
    )
      .execute(&self.mysql_pool)
      .await;

    let record_id = Self::handle_results(query_result)?;
    Ok(record_id)
  }

  fn handle_results(query_result: Result<MySqlQueryResult, sqlx::Error>) -> AnyhowResult<u64> {
    let record_id = match query_result {
      Ok(res) => {
        res.last_insert_id()
      },
      Err(err) => {
        warn!("Insert record DB error: {:?}", err);

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
}
