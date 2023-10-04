use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::error;
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use enums::by_table::media_uploads::media_upload_type::MediaUploadType;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::files::media_upload::MediaUploadToken;
use tokens::tokens::dataset::ZsDatasetToken;


pub struct ZsDataset {
    pub token: ZsDatasetToken,
    pub title: String,
    pub ietf_language_tag: String,
    pub ietf_primary_language_subtag: String,
    pub maybe_creator_user_token: Option<String>,
}

pub async fn get_dataset_by_token(
  dataset_token: &ZsDatasetToken,
  mysql_pool: &MySqlPool,
) -> AnyhowResult<Option<ZsDataset>> {
  let mut connection = mysql_pool.acquire().await?;
  get_dataset_by_token_with_connection(
    dataset_token,
    &mut connection
  ).await
}

pub async fn get_dataset_by_token_with_connection(
  dataset_token: &ZsDatasetToken,
  mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<Option<ZsDataset>> {
    let maybe_result = sqlx::query_as!(
      RawDataset,
        r#"
        SELECT
        zd.token as `token: tokens::tokens::dataset::ZsDatasetToken`,
        zd.title,
        zd.ietf_language_tag,
        zd.ietf_primary_language_subtag,
        zd.maybe_creator_user_token,
        zd.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`
        FROM zs_voice_datasets as zd
        WHERE
            zd.token = ?
            AND zd.user_deleted_at IS NULL
            AND zd.mod_deleted_at IS NULL
            "#,
        dataset_token.as_str()
        )
        .fetch_one(mysql_connection).await;

    let record = match maybe_result {
        Ok(record) => record,
        Err(sqlx::Error::RowNotFound) => {
            return Ok(None);
        },
        Err(err) => {
            error!(
                "Error fetching dataset by token: {:?}",
                err
            );
            return Err(anyhow!(
                "Error fetching dataset by token: {:?}",
                err
            ));
        }
    };

    Ok(Some(ZsDataset {
        token: record.token,
        title: record.title,
        ietf_language_tag: record.ietf_language_tag,
        ietf_primary_language_subtag: record.ietf_primary_language_subtag,
        maybe_creator_user_token: record.maybe_creator_user_token,
    }))
}
#[derive(Serialize)]
pub struct RawDataset {
    token: ZsDatasetToken,
    title: String,
    ietf_language_tag: String,
    ietf_primary_language_subtag: String,
    maybe_creator_user_token: Option<String>,
    creator_set_visibility: Visibility,
}