use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use log::warn;
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

#[derive(Serialize)]
pub struct TtsLeaderboardRecordForList {
  pub username: String,
  pub display_name: String,
  pub gravatar_hash: String,
  pub creator_user_token: String,
  pub uploaded_count: i64,
}

#[derive(Serialize)]
struct TtsLeaderboardRecordForListRaw {
  pub username: String,
  pub display_name: String,
  pub gravatar_hash: String,
  pub creator_user_token: String,
  pub uploaded_count: i64,
}

// NB: This may need to become an offline query if it is expensive.
pub async fn calculate_tts_model_leaderboard(
  mysql_pool: &mut PoolConnection<MySql>
) -> AnyhowResult<Vec<TtsLeaderboardRecordForList>> {

  // NB: We're not requiring "is_public_listing_approved IS TRUE" for TTS models
  // This is the opposite for W2L templates (for now at least)
  let maybe_results = sqlx::query_as!(
      TtsLeaderboardRecordForListRaw,
        r#"
SELECT
  users.username,
  users.display_name,
  users.email_gravatar_hash as gravatar_hash,
  creator_user_token,
  count(*) as uploaded_count
FROM tts_models
JOIN users
ON
  users.token = creator_user_token
WHERE
  users.is_banned IS FALSE
  AND tts_models.user_deleted_at IS NULL
  AND tts_models.mod_deleted_at IS NULL
GROUP BY creator_user_token
ORDER BY uploaded_count desc
LIMIT 25;
        "#,
    )
      .fetch_all(mysql_pool)
      .await;

  let results : Vec<TtsLeaderboardRecordForListRaw> = match maybe_results {
    Ok(results) => results,
    Err(err) => {
      warn!("Error: {:?}", err);

      match err {
        sqlx::Error::RowNotFound => {
          return Ok(Vec::new());
        },
        _ => {
          warn!("tts leaderboard query error: {:?}", err);
          return Err(anyhow!("tts leaderboard query error"));
        }
      }
    }
  };

  Ok(results.into_iter()
      .map(|result| {
        TtsLeaderboardRecordForList {
          username: result.username.to_string(),
          display_name: result.display_name.to_string(),
          gravatar_hash: result.gravatar_hash.to_string(),
          creator_user_token: result.creator_user_token.to_string(),
          uploaded_count: result.uploaded_count,
        }
      })
      .collect::<Vec<TtsLeaderboardRecordForList>>())
}
