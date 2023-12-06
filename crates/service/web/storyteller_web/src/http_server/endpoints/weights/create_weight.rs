use std::collections::HashSet;
use std::sync::Arc;

use actix_multipart::Multipart;
use actix_web::{HttpRequest, HttpResponse, web};
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use mysql_queries::queries::model_weights::create_weight::{self, create_weight};
use once_cell::sync::Lazy;

use tokens::tokens::model_weights::ModelWeightToken;

use crate::http_server::endpoints::media_uploads::common::upload_error::UploadError;
use crate::server_state::ServerState;

use log::{error, info, warn};

use buckets::public::weight_uploads::original_file::WeightUploadOriginalFilePath;
use enums::by_table::media_uploads::media_upload_source::MediaUploadSource;
use enums::by_table::media_uploads::media_upload_type::MediaUploadType;
use enums::common::visibility::Visibility;
use hashing::sha256::sha256_hash_bytes::sha256_hash_bytes;
use http_server_common::request::get_request_ip::get_request_ip;
use media::decode_basic_audio_info::decode_basic_audio_bytes_info;
use mimetypes::mimetype_for_bytes::get_mimetype_for_bytes;
use mysql_queries::queries::media_uploads::get_media_upload_by_uuid::get_media_upload_by_uuid_with_connection;
use mysql_queries::queries::media_uploads::insert_media_upload::{Args, insert_media_upload};

use crate::http_server::endpoints::media_uploads::common::drain_multipart_request::{drain_multipart_request, MediaSource};
use crate::validations::validate_idempotency_token_format::validate_idempotency_token_format;
use utoipa::ToSchema;

#[derive(Serialize,ToSchema)]
pub struct UploadWeightsSuccessResponse {
  pub success: bool,
  pub upload_token: ModelWeightToken,
}

static ALLOWED_MIME_TYPES : Lazy<HashSet<&'static str>> = Lazy::new(|| {
  HashSet::from([
    "binary/octet-stream",
  ])
});

// pub async fn create_weight_handler(
//   http_request: HttpRequest,
//   server_state: web::Data<Arc<ServerState>>,
//   mut multipart_payload: Multipart,
// ) -> Result<HttpResponse, UploadError> {

 

//   let weight_upload_token = response.to_model_token();

//   let response: UploadWeightsSuccessResponse = UploadWeightsSuccessResponse {
//     success: true,
//     upload_token: weight_upload_token,
//   };

//   let body = serde_json::to_string(&response)
//       .map_err(|e| UploadError::ServerError)?;

//   return Ok(HttpResponse::Ok()
//       .content_type("application/json")
//       .body(body));
// }

// pub enum SuccessCase {
//   WeightAlreadyUploaded {
//     existing_upload_token: ModelWeightToken,
//   },
//   WeightSuccessfullyUploaded {
//     upload_token: ModelWeightToken,
//   }
// }

// impl SuccessCase {
//   pub fn to_model_token(self) -> ModelWeightToken {
//     match self {
//       SuccessCase::WeightAlreadyUploaded { existing_upload_token } => existing_upload_token,
//       SuccessCase::WeightSuccessfullyUploaded { upload_token } => upload_token,
//     }
//   }
// }


//   let token = create_weight(CreateModelWeightsArgs {
//     token: &ModelWeightToken::generate(),
//     weights_type: WeightsType::LoRA, // to do parse multi part for this
//     weights_category: WeightsCategory::ImageGeneration,
//     title: upload_weights_request.file_name.as_deref(),
//     maybe_thumbnail_token: &ThumbnailToken::generate(),
//     description_markdown: "",
//     description_rendered_html: "",
//     creator_user_token: maybe_user_token.as_str(),
//     creator_ip_address: &ip_address,
//     creator_set_visibility,
//     maybe_last_update_user_token: "",
//     original_download_url: "",
//     original_filename: upload_weights_request.file_name.as_deref(),
//     file_size_bytes: file_size_bytes as i32,
//     file_checksum_sha2: hash,
//     private_bucket_hash: private_bucket_hash,
//     maybe_private_bucket_prefix: None,
//     maybe_private_bucket_extension: None,
//     cached_user_ratings_total_count: 0,
//     cached_user_ratings_positive_count: 0,
//     cached_user_ratings_negative_count: 0,
//     maybe_cached_user_ratings_ratio: None,
//     version: 0,
//     mysql_pool: &server_state.mysql_pool,
//   }).await
//       .map_err(|e| {
//         error!("Error creating weights upload: {:?}", e);
//         UploadError::ServerError
//       })?;

//   info!("new weights upload id: {} token: {:?}", record_id, &token);

//   Ok()
// }
