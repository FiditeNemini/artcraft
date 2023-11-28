use anyhow::anyhow;
use log::warn;
use sqlx::MySqlPool;

use enums::by_table::favorites::favorite_entity_type::FavoriteEntityType;
use errors::AnyhowResult;

use crate::queries::favorites::list_user_favorites_result::{RawUserFavoriteRecord, UserFavorite};

pub async fn list_user_favorites(
  username: &str,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Vec<UserFavorite>> {

  /// TODO(bt,2023-11-21): Maybe this query can use a switch
  ///  See: https://stackoverflow.com/questions/2761574/mysql-use-case-else-value-as-join-parameter
  let maybe_results= sqlx::query_as!(
      RawUserFavoriteRecord,
        r#"
SELECT
    f.token as `token: tokens::tokens::favorites::FavoriteToken`,
    f.entity_type as `entity_type: enums::by_table::favorites::favorite_entity_type::FavoriteEntityType`,
    f.entity_token,
    f.user_token as `user_token: tokens::tokens::users::UserToken`,
    u.username,
    u.display_name as user_display_name,
    u.email_gravatar_hash as user_gravatar_hash,
    f.created_at,
    f.updated_at,
    f.deleted_at,

    media_files.media_type as `maybe_media_file_type: enums::by_table::media_files::media_file_type::MediaFileType`,
    media_files.origin_product_category as `maybe_media_file_origin_category: enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory`,

    tts_models.title as maybe_descriptive_text_tts_model_title,
    tts_results.raw_inference_text as maybe_descriptive_text_tts_result_inference_text,
    users.display_name as maybe_descriptive_text_user_display_name,
    voice_conversion_models.title as maybe_descriptive_text_voice_conversion_model_title,
    zs_voices.title as maybe_descriptive_text_zs_voice_title

FROM
    favorites AS f
JOIN users AS u
    ON f.user_token = u.token

LEFT OUTER JOIN media_files ON media_files.token = f.entity_token
LEFT OUTER JOIN tts_models ON tts_models.token = f.entity_token
LEFT OUTER JOIN tts_results ON tts_results.token = f.entity_token
LEFT OUTER JOIN users ON users.token = f.entity_token
LEFT OUTER JOIN voice_conversion_models ON voice_conversion_models.token = f.entity_token
LEFT OUTER JOIN zs_voices ON zs_voices.token = f.entity_token

WHERE
    u.username = ?
    AND f.deleted_at IS NULL
ORDER BY f.id DESC
LIMIT 50
        "#,
      username
    )
      .fetch_all(mysql_pool)
      .await;

  match maybe_results {
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(Vec::new()),
      _ => {
        warn!("list favorites db error: {:?}", err);
        Err(anyhow!("error with query: {:?}", err))
      }
    },
    Ok(results) => Ok(results.into_iter()
        .map(|favorite| favorite.into_public_type())
        .collect()),
  }
}

pub async fn list_user_favorites_by_entity_type(
  username: &str,
  entity_type: FavoriteEntityType,
  mysql_pool: &MySqlPool
) -> AnyhowResult<Vec<UserFavorite>> {

  let maybe_results= sqlx::query_as!(
      RawUserFavoriteRecord,
        r#"
SELECT
    f.token as `token: tokens::tokens::favorites::FavoriteToken`,
    f.entity_type as `entity_type: enums::by_table::favorites::favorite_entity_type::FavoriteEntityType`,
    f.entity_token,
    f.user_token as `user_token: tokens::tokens::users::UserToken`,
    u.username,
    u.display_name as user_display_name,
    u.email_gravatar_hash as user_gravatar_hash,
    f.created_at,
    f.updated_at,
    f.deleted_at,

    media_files.media_type as `maybe_media_file_type: enums::by_table::media_files::media_file_type::MediaFileType`,
    media_files.origin_product_category as `maybe_media_file_origin_category: enums::by_table::media_files::media_file_origin_category::MediaFileOriginCategory`,

    tts_models.title as maybe_descriptive_text_tts_model_title,
    tts_results.raw_inference_text as maybe_descriptive_text_tts_result_inference_text,
    users.display_name as maybe_descriptive_text_user_display_name,
    voice_conversion_models.title as maybe_descriptive_text_voice_conversion_model_title,
    zs_voices.title as maybe_descriptive_text_zs_voice_title

FROM
    favorites AS f
JOIN users AS u
    ON f.user_token = u.token

LEFT OUTER JOIN media_files ON media_files.token = f.entity_token
LEFT OUTER JOIN tts_models ON tts_models.token = f.entity_token
LEFT OUTER JOIN tts_results ON tts_results.token = f.entity_token
LEFT OUTER JOIN users ON users.token = f.entity_token
LEFT OUTER JOIN voice_conversion_models ON voice_conversion_models.token = f.entity_token
LEFT OUTER JOIN zs_voices ON zs_voices.token = f.entity_token

WHERE
    u.username = ?
    AND f.entity_type = ?
    AND f.deleted_at IS NULL
ORDER BY f.id DESC
LIMIT 50
        "#,
      username,
      entity_type
    )
      .fetch_all(mysql_pool)
      .await;

  match maybe_results {
    Err(err) => match err {
      sqlx::Error::RowNotFound => Ok(Vec::new()),
      _ => {
        warn!("list favorites db error: {:?}", err);
        Err(anyhow!("error with query: {:?}", err))
      }
    },
    Ok(results) => Ok(results.into_iter()
        .map(|favorite| favorite.into_public_type())
        .collect()),
  }
}
