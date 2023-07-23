use crate::memory_cache::model_token_to_info_cache::{ModelInfoLite, ModelTokenToInfoCache};
use enums::by_table::generic_inference_jobs::inference_category::InferenceCategory;
use enums::by_table::generic_inference_jobs::inference_model_type::InferenceModelType;
use enums::by_table::voice_conversion_models::voice_conversion_model_type::VoiceConversionModelType;
use log::{debug, error, info};
use mysql_queries::queries::voice_conversion::model_info_lite::list_voice_conversion_model_info_lite::list_voice_conversion_model_info_lite;
use sqlx::MySqlPool;
use std::time::Duration;

pub async fn poll_model_token_info_thread(
  model_token_info_cache: ModelTokenToInfoCache,
  mysql_pool: MySqlPool,
) {
  let startup_wait = easyenv::get_env_duration_seconds_or_default(
    "POLL_MODEL_TOKEN_STARTUP_WAIT_DURATION_SECS", Duration::from_secs(5));

  let interval_wait = easyenv::get_env_duration_seconds_or_default(
    "POLL_MODEL_TOKEN_INTERVAL_SECS", Duration::from_secs(10 * 60));

  std::thread::sleep(startup_wait);

  loop {
    debug!("Job fetching token info...");

    let token_infos=
        match list_voice_conversion_model_info_lite(&mysql_pool).await {
          Ok(infos) => infos,
          Err(err) => {
            error!("Error polling model token info: {:?}", err);
            std::thread::sleep(interval_wait);
            continue;
          }
        };

    let mut token_info_items = Vec::with_capacity(token_infos.len());

    for token_info in token_infos.into_iter() {
      let model_type = match token_info.model_type {
        VoiceConversionModelType::RvcV2 => InferenceModelType::RvcV2,
        VoiceConversionModelType::SoVitsSvc => InferenceModelType::SoVitsSvc,
        VoiceConversionModelType::SoftVc => {
          continue // NB: SoftVC is not supported.
        },
      };

      let info = ModelInfoLite {
        inference_category: InferenceCategory::VoiceConversion,
        model_type: InferenceModelType::RvcV2,
      };

      token_info_items.push((token_info.token.to_string(), info));
    }

    let database_count = token_info_items.len();

    info!("Job found {} token info items from database.", database_count);

    if let Err(err) = model_token_info_cache.insert_many(token_info_items) {
      error!("Error inserting model token info: {:?}", err);
    }

    std::thread::sleep(interval_wait);
  }
}
