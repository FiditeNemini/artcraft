use anyhow::anyhow;
use container_common::anyhow_result::AnyhowResult;
use log::warn;
use sqlx::MySqlPool;

#[derive(Serialize)]
pub struct W2lLeaderboardRecordForList {
  pub username: String,
  pub display_name: String,
  pub gravatar_hash: String,
  pub creator_user_token: String,
  pub uploaded_count: i64,
}

#[derive(Serialize)]
pub struct W2lLeaderboardRecordForListRaw {
  pub username: String,
  pub display_name: String,
  pub gravatar_hash: String,
  pub creator_user_token: String,
  pub uploaded_count: i64,
}

// NB: This may need to become an offline query if it is expensive.
pub async fn calculate_w2l_template_leaderboard(
  mysql_pool: &MySqlPool
) -> AnyhowResult<Vec<W2lLeaderboardRecordForList>> {

  // NB: We're requiring "is_public_listing_approved IS TRUE" for W2L templates!
  // This is the opposite for TTS models (for now at least)
  let maybe_results = sqlx::query_as!(
      W2lLeaderboardRecordForListRaw,
        r#"
SELECT
  users.username,
  users.display_name,
  users.email_gravatar_hash as gravatar_hash,
  creator_user_token,
  count(*) as uploaded_count
FROM w2l_templates
JOIN users
ON
  users.token = creator_user_token
WHERE
  is_public_listing_approved IS TRUE
  AND users.is_banned IS FALSE
  AND w2l_templates.user_deleted_at IS NULL
  AND w2l_templates.mod_deleted_at IS NULL
GROUP BY creator_user_token
ORDER BY uploaded_count desc
LIMIT 25;
        "#,
    )
      .fetch_all(mysql_pool)
      .await;

  let results : Vec<W2lLeaderboardRecordForListRaw> = match maybe_results {
    Ok(results) => results,
    Err(err) => {
      warn!("Error: {:?}", err);

      match err {
        sqlx::Error::RowNotFound => {
          return Ok(Vec::new());
        },
        _ => {
          warn!("w2l leaderboard query error: {:?}", err);
          return Err(anyhow!("w2l leaderboard query error"));
        }
      }
    }
  };

  Ok(results.into_iter()
      .map(|result| {
        W2lLeaderboardRecordForList {
          username: result.username.to_string(),
          display_name: result.display_name.to_string(),
          gravatar_hash: result.gravatar_hash.to_string(),
          creator_user_token: result.creator_user_token.to_string(),
          uploaded_count: result.uploaded_count,
        }
      })
      .collect::<Vec<W2lLeaderboardRecordForList>>())
}
