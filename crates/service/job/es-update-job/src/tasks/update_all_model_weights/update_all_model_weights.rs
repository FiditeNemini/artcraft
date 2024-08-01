use std::sync::Arc;
use std::time::Duration;

use anyhow::anyhow;
use chrono::{DateTime, Utc};
use elasticsearch::{BulkOperation, BulkParts, Elasticsearch};
use log::{error, info};
use serde_json::Value;

use elasticsearch_schema::documents::model_weight_document::{MODEL_WEIGHT_INDEX, ModelWeightDocument};
use elasticsearch_schema::traits::document::Document;
use enums::by_table::model_weights::weights_category::WeightsCategory;
use errors::AnyhowResult;
use mysql_queries::queries::model_weights::batch_get::batch_get_model_weights_for_elastic_search_backfill::{batch_get_model_weights_for_elastic_search_backfill, ModelWeightForElasticsearchRecord};
use mysql_queries::queries::model_weights::list::list_model_weight_tokens_updated_since::list_model_weight_tokens_updated_since;

use crate::job_state::JobState;

pub async fn update_all_model_weights(job_state: Arc<JobState>) {
  // TODO(bt,2024-02-05): Write this cursor to Redis so job can resume without reindexing everything.
  let mut cursor = DateTime::UNIX_EPOCH;

  loop {
    info!("Main loop; cursor @ {:?}", &cursor);

    let result = with_database_main_loop(&mut cursor, &job_state).await;

    if let Err(err) = result {
      error!("Error in main loop: {:?}", err);
      std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_error_wait_millis));
    }

    // NB: Function should never return in success case, but we'll sleep just in case.
  }
}

pub async fn with_database_main_loop(updated_at_cursor: &mut DateTime<Utc>, job_state: &JobState) -> AnyhowResult<()> {
  info!("Acquiring MySQL connection...");

  let mut mysql_connection = job_state.mysql_pool.acquire().await?;

  let mut last_successful_update_at = *updated_at_cursor;

  loop {
    info!("Querying tokens updated since: {:?}", &updated_at_cursor);

    let mut maybe_tokens =
        list_model_weight_tokens_updated_since(&mut *mysql_connection, &updated_at_cursor).await?;

    if maybe_tokens.is_empty() {
      info!("No records updated since {:?}", &updated_at_cursor);
      std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_no_updates_wait_millis));
      continue;
    }

    info!("Found {} updated records", maybe_tokens.len());

    let mut last_observed_updated_at = *updated_at_cursor;

    while !maybe_tokens.is_empty() {
      // NB: This list might be very large if we query from (1) the epoch, or (2) there was a large series of updates
      let last = 50.min(maybe_tokens.len());
      let drained_tokens = maybe_tokens.drain(0..last)
          .into_iter()
          .map(|record| record.token)
          .collect::<Vec<_>>();

      let records
          = batch_get_model_weights_for_elastic_search_backfill(&mut *mysql_connection, &drained_tokens).await?;

      for record in records {
        let updated_at = record.updated_at;

        create_document_from_record(&job_state.elasticsearch, record).await?;

        // NB: We don't want to advance the cursor to the current second just yet, because we might be processing
        // several records with the exact same "updated_at" timestamp. We do know that due to ordering, we can update
        // the timestamp cursor to the second before this timestamp, however.
        //
        // If we change the cursoring or batch sizes, we'll need to reconsider all of this logic.
        if let Some(cursor_at_least) = updated_at.checked_sub_signed(chrono::Duration::seconds(1)) {
          // NB: We don't want the cursor to slide backwards (it shouldn't, but the max will save us).
          last_successful_update_at = cursor_at_least.max(last_successful_update_at);
        }

        *updated_at_cursor = last_successful_update_at.max(*updated_at_cursor);

        last_observed_updated_at = updated_at;

        std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_es_writes_wait_millis));
      }

      std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_job_batch_wait_millis));
    }

    // NB: The last cursor math put us a second behind the current clock. Here we'll advance to the last record.
    // NB: This technically could miss records if we're updating within the same second batch we read from, but that
    // seems both unlikely and not worth solving at our present scale.
    *updated_at_cursor = last_observed_updated_at.max(*updated_at_cursor);

    info!("Up to date at cursor = {:?}", &updated_at_cursor);

    std::thread::sleep(Duration::from_millis(job_state.sleep_config.between_query_wait_millis));
  }
}

async fn create_document_from_record(elasticsearch: &Elasticsearch, record: ModelWeightForElasticsearchRecord) -> AnyhowResult<()> {
  info!("Create record for {:?} - {:?}", record.token, record.title);

  let is_deleted = record.user_deleted_at.is_some() || record.mod_deleted_at.is_some();

  let document = ModelWeightDocument {
    token: record.token,

    creator_set_visibility: record.creator_set_visibility,

    weights_type: record.weights_type,
    weights_category: record.weights_category,

    title: record.title.to_string(),
    title_as_keyword: record.title,

    maybe_cover_image_media_file_token: record.maybe_cover_image_media_file_token,
    maybe_cover_image_public_bucket_hash: record.maybe_cover_image_public_bucket_hash,
    maybe_cover_image_public_bucket_prefix: record.maybe_cover_image_public_bucket_prefix,
    maybe_cover_image_public_bucket_extension: record.maybe_cover_image_public_bucket_extension,

    creator_user_token: record.creator_user_token,
    creator_username: record.creator_username,
    creator_display_name: record.creator_display_name,
    creator_gravatar_hash: record.creator_gravatar_hash,

    ratings_positive_count: record.maybe_ratings_positive_count.unwrap_or(0),
    ratings_negative_count: record.maybe_ratings_negative_count.unwrap_or(0),
    bookmark_count: record.maybe_bookmark_count.unwrap_or(0),

    maybe_ietf_language_tag: match record.weights_category {
      WeightsCategory::TextToSpeech => record.maybe_tts_ietf_language_tag,
      WeightsCategory::VoiceConversion => record.maybe_voice_conversion_ietf_language_tag,
      _ => None,
    },

    maybe_ietf_primary_language_subtag: match record.weights_category {
      WeightsCategory::TextToSpeech => record.maybe_tts_ietf_primary_language_subtag,
      WeightsCategory::VoiceConversion => record.maybe_voice_conversion_ietf_primary_language_subtag,
      _ => None,
    },

    created_at: record.created_at,
    updated_at: record.updated_at,
    user_deleted_at: record.user_deleted_at,
    mod_deleted_at: record.mod_deleted_at,

    database_read_time: record.database_read_time,

    is_deleted,
  };

  let op : BulkOperation<_> = BulkOperation::index(&document)
      .id(document.get_document_id())
      .into();

  let response = elasticsearch
      .bulk(BulkParts::Index(MODEL_WEIGHT_INDEX))
      .body(vec![op])
      .send()
      .await?;

  let json: Value = response.json().await?;

  let had_errors = json["errors"].as_bool().unwrap_or(false);

  if had_errors {
    let failed: Vec<&Value> = json["items"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|v| !v["error"].is_null())
        .collect();

    error!("Errors during indexing. Failures: {}", failed.len());

    return Err(anyhow!("Errors during indexing. Failures: {}", failed.len()));
  }

  Ok(())
}
