use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::{info, warn};
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::model_weights::ModelWeightToken;

use enums::by_table::model_weights::{
    weights_types::WeightsType,
    weights_category::WeightsCategory,
};
use tokens::tokens::users::UserToken;

#[derive(Serialize)]
pub struct WeightsJoinUserRecord {
    pub token: ModelWeightToken,
    pub title: String,
    pub weights_type: WeightsType,
    pub weights_category: WeightsCategory,
    pub maybe_thumbnail_token: Option<String>,
    pub description_markdown: String,
    pub description_rendered_html: String,
    pub creator_user_token: UserToken,
    pub creator_ip_address: String,
    pub creator_set_visibility: Visibility,
    pub maybe_last_update_user_token: Option<UserToken>,
    pub original_download_url: Option<String>,
    pub original_filename: Option<String>,
    pub file_size_bytes: i32,
    pub file_checksum_sha2: String,
    pub private_bucket_hash: String,
    pub maybe_private_bucket_prefix: Option<String>,
    pub maybe_private_bucket_extension: Option<String>,
    pub cached_user_ratings_negative_count: u32,
    pub cached_user_ratings_positive_count: u32,
    pub cached_user_ratings_total_count: u32,
    pub maybe_cached_user_ratings_ratio: Option<f32>,
    pub cached_user_ratings_last_updated_at: DateTime<Utc>,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_deleted_at: Option<DateTime<Utc>>,
    pub mod_deleted_at: Option<DateTime<Utc>>
}

pub async fn list_weights_by_username(
    mysql_pool: &MySqlPool,
    username: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<WeightsJoinUserRecord>> {
    let mut connection = mysql_pool.acquire().await?;
    list_weights_by_username_with_connection(&mut connection, username, can_see_deleted).await
}

pub async fn list_weights_by_username_with_connection(
    mysql_connection: &mut PoolConnection<MySql>,
    creator_username: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<WeightsJoinUserRecord>> {

    let datasets =
            list_datasets_by_creator_username(mysql_connection, creator_username, can_see_deleted)
                .await;

    let datasets : Vec<WeightsJoinUserRecord> = match datasets {
        Ok(datasets) => datasets,
        Err(err) => {
            match err {
                RowNotFound => {
                    return Ok(Vec::new());
                },
                _ => {
                    warn!("weights dataset list query error: {:?}", err);
                    return Err(anyhow!("weights dataset list query error"));
                }
            }
        }
    };

    Ok(datasets.into_iter()
        .map(|dataset: WeightsJoinUserRecord| {
            WeightsJoinUserRecord {
                // weights_token: ModelWeightToken(dataset.token),
                // title: dataset.title,
                // creator_user_token: dataset.creator_user_token,
                // creator_username: dataset.creator_username,
                // creator_ip_address: dataset.creator_ip_address,
                // weights_type: dataset.weights_type,
                // weights_category: dataset.weights_category,
                // description_markdown: dataset.description_markdown,
                // description_rendered_html: dataset.description_rendered_html,
                // cached_user_ratings_negative_count: dataset.cached_user_ratings_negative_count,
                // cached_user_ratings_positive_count: dataset.cached_user_ratings_positive_count,
                // cached_user_ratings_total_count: dataset.cached_user_ratings_total_count,
                // maybe_cached_user_ratings_ratio: dataset.maybe_cached_user_ratings_ratio,
                // cached_user_ratings_total_count: dataset.cached_user_ratings_total_count,
                // created_at: dataset.created_at,
                // updated_at: dataset.updated_at,
            }
        })
        .filter(|dataset| {
            dataset.weights_token == creator_username || dataset.creator_set_visibility == Visibility::Public || can_see_deleted
        })
        .collect::<Vec<WeightsRecord>>())
}


async fn list_weights_by_creator_username(
    mysql_connection: &mut PoolConnection<MySql>,
    creator_username: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<WeightsRecord>> {
    // TODO: There has to be a better way.
    //  Sqlx doesn't like anything except string literals.
    let maybe_datasets = if !can_see_deleted {
        info!("listing datasets for user;");
        sqlx::query_as!(
            WeightsRecord,
        r#"
        SELECT
            zd.token as `token: tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken`,
            zd.title,
            zd.ietf_language_tag,
            zd.ietf_primary_language_subtag,
            users.token as `creator_user_token: tokens::tokens::users::UserToken`,
            users.username as creator_username,
            users.display_name as creator_display_name,
            users.email_gravatar_hash as creator_email_gravatar_hash,
            zd.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
            zd.created_at,
            zd.updated_at
        FROM zs_voice_datasets as zd
        JOIN users
            ON users.token = zd.maybe_creator_user_token
        WHERE
            users.username = ?
            AND zd.user_deleted_at IS NULL
            AND zd.mod_deleted_at IS NULL
        "#,
      creator_username)
            .fetch_all(mysql_connection)
            .await?
    } else {
        info!("listing datasets for user");
        sqlx::query_as!(
            WeightsRecord
            ,
        r#"
        SELECT
            zd.token as `token: tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken`,
            zd.title,
            zd.ietf_language_tag,
            zd.ietf_primary_language_subtag,
            users.token as `creator_user_token: tokens::tokens::users::UserToken`,
            users.username as creator_username,
            users.display_name as creator_display_name,
            users.email_gravatar_hash as creator_email_gravatar_hash,
            zd.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
            zd.created_at,
            zd.updated_at
        FROM zs_voice_datasets as zd
        JOIN users
            ON users.token = zd.maybe_creator_user_token
        WHERE
            users.username = ?
        "#,
      creator_username)
            .fetch_all(mysql_connection)
            .await?
    };

    Ok(maybe_datasets)
}


#[derive(Serialize)]
pub struct RawWeightJoinUser {
    pub token: ModelWeightToken,
    pub title: String,
    pub weights_type: WeightsType,
    pub weights_category: WeightsCategory,
    pub maybe_thumbnail_token: Option<String>,
    pub description_markdown: String,
    pub description_rendered_html: String,
    pub creator_user_token: UserToken,
    pub creator_ip_address: String,
    pub creator_set_visibility: Visibility,
    pub maybe_last_update_user_token: Option<UserToken>,
    pub original_download_url: Option<String>,
    pub original_filename: Option<String>,
    pub file_size_bytes: i32,
    pub file_checksum_sha2: String,
    pub private_bucket_hash: String,
    pub maybe_private_bucket_prefix: Option<String>,
    pub maybe_private_bucket_extension: Option<String>,
    pub cached_user_ratings_negative_count: u32,
    pub cached_user_ratings_positive_count: u32,
    pub cached_user_ratings_total_count: u32,
    pub maybe_cached_user_ratings_ratio: Option<f32>,
    pub cached_user_ratings_last_updated_at: DateTime<Utc>,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub user_deleted_at: Option<DateTime<Utc>>,
    pub mod_deleted_at: Option<DateTime<Utc>>,
}

#[cfg(test)]
mod tests {

  #[test]
  fn test() {
    assert_eq!("one", "two"); // This fails
  }

}
