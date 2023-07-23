use crate::queries::voice_conversion::model_info_lite::model_info_lite::VoiceConversionModelInfoLite;
use enums::by_table::voice_conversion_models::voice_conversion_model_type::VoiceConversionModelType;
use errors::AnyhowResult;
use sqlx::pool::PoolConnection;
use sqlx::{MySql, MySqlPool};
use tokens::voice_conversion::model::VoiceConversionModelToken;

pub async fn list_voice_conversion_model_info_lite(
  mysql_pool: &MySqlPool,
) -> AnyhowResult<Vec<VoiceConversionModelInfoLite>> {
  let mut connection = mysql_pool.acquire().await?;
  list_voice_conversion_model_info_lite_with_connection(&mut connection).await
}

pub async fn list_voice_conversion_model_info_lite_with_connection(
  mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<Vec<VoiceConversionModelInfoLite>> {

  let models = sqlx::query_as!(
      RawVoiceConversionModelInfoLite,
        r#"
SELECT
    vc.token as `token: tokens::voice_conversion::model::VoiceConversionModelToken`,
    vc.model_type as `model_type: enums::by_table::voice_conversion_models::voice_conversion_model_type::VoiceConversionModelType`
FROM voice_conversion_models as vc
        "#)
          .fetch_all(mysql_connection)
          .await?;

  Ok(models.into_iter()
    .map(|model| {
      VoiceConversionModelInfoLite {
        token: model.token,
        model_type: model.model_type,
      }
    })
    .collect::<Vec<VoiceConversionModelInfoLite>>())
}

struct RawVoiceConversionModelInfoLite {
  pub token: VoiceConversionModelToken,
  pub model_type: VoiceConversionModelType,
}
