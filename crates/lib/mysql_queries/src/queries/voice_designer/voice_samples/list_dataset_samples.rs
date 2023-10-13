use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::warn;
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use errors::AnyhowResult;
use tokens::tokens::users::UserToken;
use tokens::tokens::zs_voice_dataset_samples::ZsVoiceDatasetSampleToken;
use tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken;

pub struct DatasetSampleRecordForList {
    pub token: ZsVoiceDatasetSampleToken,
    pub dataset_token: ZsVoiceDatasetToken,

    pub maybe_creator_user_token: Option<UserToken>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    // TODO: Other fields
}


pub async fn list_samples(
    dataset_token: &ZsVoiceDatasetToken,
    can_see_deleted: bool,
    mysql_pool: &MySqlPool,
) -> AnyhowResult<Vec<DatasetSampleRecordForList>> {
    let mut connection = mysql_pool.acquire().await?;
    list_samples_by_dataset_token_with_connection(
        dataset_token,
        can_see_deleted,
        &mut connection
    ).await
}

pub async fn list_samples_by_dataset_token_with_connection(
    dataset_token: &ZsVoiceDatasetToken,
    can_see_deleted: bool,
    mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<Vec<DatasetSampleRecordForList>> {


    let maybe_samples = list_samples_by_dataset_token(
        mysql_connection,
        dataset_token,
        can_see_deleted
    ).await;

    let records = match maybe_samples {
        Ok(records) => records,
        Err(err) => {
            match err {
                RowNotFound => {
                    return Ok(Vec::new());
                },
                _ => {
                    warn!("dataset sample list query error: {:?}", err);
                    return Err(anyhow!("Error fetching dataset samples by dataset token: {:?}", err));
                }
            }
        }
    };

    Ok(records.into_iter()
        .map(|record| {
            DatasetSampleRecordForList {
                token: record.token,
                dataset_token: record.dataset_token,
                maybe_creator_user_token: record.maybe_creator_user_token,
                created_at: record.created_at,
                updated_at: record.updated_at,
            }
        })
        .collect()
    )
}

async fn list_samples_by_dataset_token(
    mysql_connection: &mut PoolConnection<MySql>,
    dataset_token: &ZsVoiceDatasetToken,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<InternalRawDatasetSampleRecordForList>> {
    let maybe_samples = if !can_see_deleted {
        sqlx::query_as!(
            InternalRawDatasetSampleRecordForList,
            r#"
                SELECT
                    zds.token as `token: tokens::tokens::zs_voice_dataset_samples::ZsVoiceDatasetSampleToken`,
                    zds.dataset_token as `dataset_token: tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken`,
                    zds.maybe_creator_user_token as `maybe_creator_user_token: tokens::tokens::users::UserToken`,
                    zds.created_at,
                    zds.updated_at
                FROM zs_voice_dataset_samples as zds
                WHERE zds.dataset_token = ?
                    AND zds.user_deleted_at IS NULL
                    AND zds.mod_deleted_at IS NULL
            "#,
            dataset_token
        ).fetch_all(mysql_connection).await?
    } else {
        sqlx::query_as!(
            InternalRawDatasetSampleRecordForList,
            r#"
                SELECT
                    zds.token as `token: tokens::tokens::zs_voice_dataset_samples::ZsVoiceDatasetSampleToken`,
                    zds.dataset_token as `dataset_token: tokens::tokens::zs_voice_datasets::ZsVoiceDatasetToken`,
                    zds.maybe_creator_user_token as `maybe_creator_user_token: tokens::tokens::users::UserToken`,
                    zds.created_at,
                    zds.updated_at
                FROM zs_voice_dataset_samples as zds
                WHERE zds.dataset_token = ?
            "#,
            dataset_token
        ).fetch_all(mysql_connection).await?
    };

    Ok(maybe_samples)
}


struct InternalRawDatasetSampleRecordForList {
    token: ZsVoiceDatasetSampleToken,
    dataset_token: ZsVoiceDatasetToken,

    maybe_creator_user_token: Option<UserToken>,

    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    // TODO: Other fields
}
