use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::{info, warn};
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::zs_dataset::ZsDatasetToken;


// FIXME: This is the old style of query scoping and shouldn't be copied.

#[derive(Serialize)]
pub struct DatasetRecordForList {
    pub dataset_token: String,
    pub title: String,
    pub creator_set_visibility: Visibility,
    pub ietf_language_tag: String,
    pub ietf_primary_language_subtag: String,
    pub maybe_creator_user_token: Option<String>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn list_datasets_by_user_token(
    mysql_pool: &MySqlPool,
    user_token: &str,
    can_see_deleted: bool,
    is_owner: bool,
) -> AnyhowResult<Vec<DatasetRecordForList>> {
    let mut connection = mysql_pool.acquire().await?;
    list_datasets_with_connection(&mut connection, user_token, can_see_deleted, is_owner).await
}

pub async fn list_datasets_with_connection(
    mysql_connection: &mut PoolConnection<MySql>,
    user_token: &str,
    can_see_deleted: bool,
    is_owner: bool,
) -> AnyhowResult<Vec<DatasetRecordForList>> {

    let datasets =
            list_datasets_by_creator_token(mysql_connection, user_token, can_see_deleted)
                .await;

    let datasets : Vec<InternalRawDatasetRecordForList> = match datasets {
        Ok(datasets) => datasets,
        Err(err) => {
            match err {
                RowNotFound => {
                    return Ok(Vec::new());
                },
                _ => {
                    warn!("dataset list query error: {:?}", err);
                    return Err(anyhow!("dataset list query error"));
                }
            }
        }
    };

    Ok(datasets.into_iter()
        .map(|dataset| {
            DatasetRecordForList{
                dataset_token: dataset.token.to_string(),
                title: dataset.title,
                creator_set_visibility: dataset.creator_set_visibility,
                ietf_language_tag: dataset.ietf_language_tag,
                ietf_primary_language_subtag: dataset.ietf_primary_language_subtag,
                maybe_creator_user_token: dataset.maybe_creator_user_token,

                created_at: dataset.created_at,
                updated_at: dataset.updated_at,
            }
        })
        .filter(|dataset| {
            is_owner || dataset.creator_set_visibility == Visibility::Public || can_see_deleted
        })
        .collect::<Vec<DatasetRecordForList>>())
}


async fn list_datasets_by_creator_token(
    mysql_connection: &mut PoolConnection<MySql>,
    creator_token: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<InternalRawDatasetRecordForList>> {
    // TODO: There has to be a better way.
    //  Sqlx doesn't like anything except string literals.
    let maybe_datasets = if !can_see_deleted {
        info!("listing datasets for user;");
        sqlx::query_as!(
      InternalRawDatasetRecordForList,
        r#"
        SELECT
            zd.token as `token: tokens::tokens::zs_dataset::ZsDatasetToken`,
            zd.title,
            zd.ietf_language_tag,
            zd.ietf_primary_language_subtag,
            zd.maybe_creator_user_token,
            zd.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
            zd.created_at,
            zd.updated_at
        FROM zs_voice_datasets as zd
        WHERE
            zd.maybe_creator_user_token = ?
            AND zd.user_deleted_at IS NULL
            AND zd.mod_deleted_at IS NULL
        "#,
      creator_token)
            .fetch_all(mysql_connection)
            .await?
    } else {
        info!("listing datasets for user");
        sqlx::query_as!(
      InternalRawDatasetRecordForList
            ,
        r#"
        SELECT
            zd.token as `token: tokens::tokens::zs_dataset::ZsDatasetToken`,
            zd.title,
            zd.ietf_language_tag,
            zd.ietf_primary_language_subtag,
            zd.maybe_creator_user_token,
            zd.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
            zd.created_at,
            zd.updated_at
        FROM zs_voice_datasets as zd
        WHERE
            zd.maybe_creator_user_token = ?
        "#,
      creator_token)
            .fetch_all(mysql_connection)
            .await?
    };

    Ok(maybe_datasets)
}

struct InternalRawDatasetRecordForList {
    token: ZsDatasetToken,
    title: String,
    ietf_language_tag: String,
    ietf_primary_language_subtag: String,
    maybe_creator_user_token: Option<String>,
    creator_set_visibility: Visibility,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}
