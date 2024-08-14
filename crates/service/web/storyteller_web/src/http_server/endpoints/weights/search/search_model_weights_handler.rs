// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use std::collections::HashSet;
use std::fmt;
use std::sync::Arc;

use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::error::ResponseError;
use actix_web::http::StatusCode;
use chrono::{DateTime, Utc};
use log::error;
use utoipa::ToSchema;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use elasticsearch_schema::searches::search_model_weights::{search_model_weights, SearchArgs};
use enums::by_table::model_weights::weights_category::WeightsCategory;
use enums::by_table::model_weights::weights_types::WeightsType;
use enums::common::visibility::Visibility;
use enums_public::by_table::model_weights::public_weights_types::PublicWeightsType;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::http_server::common_responses::simple_entity_stats::SimpleEntityStats;
use crate::http_server::common_responses::user_details_lite::UserDetailsLight;
use crate::http_server::common_responses::weights_cover_image_details::WeightsCoverImageDetails;
use crate::http_server::web_utils::response_error_helpers::to_simple_json_error;
use crate::state::server_state::ServerState;

#[derive(Deserialize, ToSchema)]
pub struct SearchModelWeightsRequest {
  pub search_term: String,
  pub weight_type: Option<WeightsType>,
  pub weight_category: Option<WeightsCategory>,
  pub ietf_language_subtag: Option<String>,
}

#[derive(Serialize, Clone, ToSchema)]
pub struct ModelWeightSearchResult {
  pub weight_token: ModelWeightToken,

  pub weight_type: PublicWeightsType,
  pub weight_category: WeightsCategory,

  pub creator_set_visibility: Visibility,

  pub title: String,

  pub creator: UserDetailsLight,

  /// Information about the cover image.
  pub cover_image: WeightsCoverImageDetails,

  #[deprecated(note="switch to CoverImageDetails")]
  pub maybe_cover_image_public_bucket_path: Option<String>,

  // Whether the model weight is featured.
  pub is_featured: bool,

  pub stats: SimpleEntityStats,

  pub maybe_ietf_language_tag: Option<String>,
  pub maybe_ietf_primary_language_subtag: Option<String>,

  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, ToSchema)]
pub struct SearchModelWeightsSuccessResponse {
  pub success: bool,
  pub weights: Vec<ModelWeightSearchResult>,
}

#[derive(Debug, ToSchema)]
pub enum SearchModelWeightsError {
  ServerError,
}

impl ResponseError for SearchModelWeightsError {
  fn status_code(&self) -> StatusCode {
    match *self {
      SearchModelWeightsError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> HttpResponse {
    let error_reason = match self {
      SearchModelWeightsError::ServerError => "server error".to_string(),
    };

    to_simple_json_error(&error_reason, self.status_code())
  }
}

// NB: Not using derive_more::Display since Clion doesn't understand it.
impl fmt::Display for SearchModelWeightsError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

#[utoipa::path(
  post,
  tag = "Model Weights",
  path = "/v1/weights/search",
  responses(
    (status = 200, description = "Successful search", body = SearchModelWeightsSuccessResponse),
    (status = 500, description = "Server error", body = SearchModelWeightsError),
  ),
  params(
    ("request" = SearchModelWeightsRequest, description = "Payload for Request"),
  )
)]
pub async fn search_model_weights_handler(
  _http_request: HttpRequest,
  request: web::Json<SearchModelWeightsRequest>,
  server_state: web::Data<Arc<ServerState>>) -> Result<HttpResponse, SearchModelWeightsError>
{
  let maybe_weights_categories = request.weight_category
      .map(|weight_category| {
        let mut set = HashSet::new();
        set.insert(weight_category);
        set
      });

  let maybe_weights_types = request.weight_type
      .map(|weight_type| {
        let mut set = HashSet::new();
        set.insert(weight_type);
        set
      });

  let results = search_model_weights(SearchArgs {
    search_term: &request.search_term,
    maybe_creator_user_token: None,
    maybe_ietf_primary_language_subtag: request.ietf_language_subtag.as_deref(),
    maybe_weights_categories,
    maybe_weights_types,
    client: &server_state.elasticsearch,
  })
      .await
      .map_err(|err| {
        error!("Searching error: {:?}", err);
        SearchModelWeightsError::ServerError
      })?;

  let results = results.into_iter()
      .map(|result| {
        let cover_image_details = WeightsCoverImageDetails::from_optional_db_fields(
          &result.token,
          result.maybe_cover_image_public_bucket_hash.as_deref(),
          result.maybe_cover_image_public_bucket_prefix.as_deref(),
          result.maybe_cover_image_public_bucket_extension.as_deref(),
        );

        let maybe_cover_image = result.maybe_cover_image_public_bucket_hash
            .as_deref()
            .map(|hash| {
              MediaFileBucketPath::from_object_hash(
                &hash,
                result.maybe_cover_image_public_bucket_prefix.as_deref(),
                result.maybe_cover_image_public_bucket_extension.as_deref())
                  .get_full_object_path_str()
                  .to_string()
            });

        ModelWeightSearchResult {
          weight_token: result.token,
          weight_type: PublicWeightsType::from_enum(result.weights_type),
          weight_category: result.weights_category,
          title: result.title,
          creator: UserDetailsLight::from_db_fields(
            &result.creator_user_token,
            &result.creator_username,
            &result.creator_display_name,
            &result.creator_gravatar_hash,
          ),
          cover_image: cover_image_details,
          maybe_cover_image_public_bucket_path: maybe_cover_image,
          is_featured: result.is_featured.unwrap_or(false),
          stats: SimpleEntityStats {
            positive_rating_count: result.ratings_positive_count,
            bookmark_count: result.bookmark_count,
          },
          maybe_ietf_language_tag: result.maybe_ietf_language_tag,
          maybe_ietf_primary_language_subtag: result.maybe_ietf_primary_language_subtag,
          creator_set_visibility: result.creator_set_visibility,
          created_at: result.created_at,
          updated_at: result.updated_at,
        }
      })
      .collect::<Vec<_>>();

  // TODO(bt,2023-10-27): For some reason Elasticsearch returns duplicates. Maybe we populated the
  //  DB twice? Need to filter them out, or React chokes and gets stuck on duplicates. (Effectively
  //  freezing them into the UI, despite component updates)

  let mut added_tokens = HashSet::new();
  let mut new_results = Vec::with_capacity(results.len());

  for result in results.into_iter() {
    if added_tokens.contains(&result.weight_token) {
      continue;
    }
    added_tokens.insert(result.weight_token.clone());
    new_results.push(result);
  }

  let response = SearchModelWeightsSuccessResponse {
    success: true,
    weights: new_results,
  };

  let body = serde_json::to_string(&response)
      .map_err(|_e| SearchModelWeightsError::ServerError)?;

  Ok(HttpResponse::Ok()
      .content_type("application/json")
      .body(body))
}
