use sqlx::MySqlPool;

use errors::AnyhowResult;
use tokens::tokens::media_files::MediaFileToken;

// TODO: Maybe support a new location or updating in-place
//pub enum UpdateType<'a> {
//  NewLocation { ... fields },
//  InPlaceUpdateGeneric { ... fields },
//  InPlaceUpdateAudio { ... fields },
//  ...
//}

pub struct UpdateArgs<'a> {
  pub media_file_token: &'a MediaFileToken,

  pub public_bucket_directory_hash: &'a str,
  pub maybe_public_bucket_prefix: Option<&'a str>,
  pub maybe_public_bucket_extension: Option<&'a str>,

  pub maybe_mime_type: Option<&'a str>,
  pub file_size_bytes: u64,
  pub sha256_checksum: &'a str,

  // TODO: Maybe make all update fields optional and use QueryBuilder.
  //pub duration_millis: u64,

  pub update_ip_address: &'a str,

  pub mysql_pool: &'a MySqlPool
}

pub async fn updated_media_file_stored_cloud_contents(args: UpdateArgs<'_>) -> AnyhowResult<()>{
  let transaction = args.mysql_pool.begin().await?;

  let _query_result = sqlx::query!(
        r#"
        UPDATE media_files
        SET
            public_bucket_directory_hash = ?,
            maybe_public_bucket_prefix = ?,
            maybe_public_bucket_extension = ?,

            maybe_mime_type = ?,
            file_size_bytes = ?,

            creator_ip_address = ?
        WHERE token = ?
        LIMIT 1
        "#,
        args.public_bucket_directory_hash,
        args.maybe_public_bucket_prefix,
        args.maybe_public_bucket_extension,

        args.maybe_mime_type,
        args.file_size_bytes,

        args.update_ip_address,

        args.media_file_token,
    ).execute(args.mysql_pool).await?;

  transaction.commit().await?;

  Ok(())
}
