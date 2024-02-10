use utoipa::ToSchema;

use buckets::public::media_files::bucket_file_path::MediaFileBucketPath;
use tokens::tokens::model_weights::ModelWeightToken;

use crate::util::placeholder_images::cover_images::default_cover_image_color_from_token::default_cover_image_color_from_token;
use crate::util::placeholder_images::cover_images::default_cover_image_from_token::default_cover_image_from_token;

/// Everything we need to create a cover image.
/// Cover images are small descriptive images that can be set for any model.
/// If a cover image is set, this is the path to the asset.
#[derive(Clone, Serialize, ToSchema)]
pub struct CoverImageDetails {
  /// If a cover image is set, this is the path to the asset.
  pub maybe_cover_image_public_bucket_path: Option<String>,

  /// For items without a cover image, we can use one of our own.
  pub default_cover: DefaultCoverInfo,
}


#[derive(Clone, Serialize,ToSchema)]
pub struct DefaultCoverInfo {
  /// Which image to show.
  pub image_index: u8,
  /// Which color to use.
  pub color_index: u8,
}

impl CoverImageDetails {

  pub fn from_optional_db_fields(
    model_weight_token: &ModelWeightToken,
    maybe_cover_image_public_bucket_path: Option<&str>,
    maybe_cover_image_public_bucket_prefix: Option<&str>,
    maybe_cover_image_public_bucket_extension: Option<&str>,
  ) -> Self {
    let maybe_bucket_path = maybe_cover_image_public_bucket_path
        .map(|hash| MediaFileBucketPath::from_object_hash(
          hash,
          maybe_cover_image_public_bucket_prefix,
          maybe_cover_image_public_bucket_extension
        ));

    let maybe_cover_image_public_bucket_path = maybe_bucket_path
        .map(|bucket_path| bucket_path
            .get_full_object_path_str()
            .to_string());

    let image_index = default_cover_image_from_token(model_weight_token);

    Self {
      maybe_cover_image_public_bucket_path,
      default_cover: DefaultCoverInfo::from_token(model_weight_token),
    }
  }
}

impl DefaultCoverInfo {
  pub fn from_token(model_weight_token: &ModelWeightToken) -> Self {
    Self {
      image_index: default_cover_image_from_token(model_weight_token),
      color_index: default_cover_image_color_from_token(model_weight_token),
    }
  }
}

#[cfg(test)]
mod tests {
  use tokens::tokens::model_weights::ModelWeightToken;

  use crate::http_server::common_responses::cover_image_details::CoverImageDetails;

  #[test]
  fn test_from_optional_db_fields() {
    let token = ModelWeightToken::new_from_str("weight_token");
    let maybe_public_bucket_hash = Some("bucket_hash");
    let maybe_prefix = Some("image_");
    let maybe_extension= Some(".png");

    let cover_image = CoverImageDetails::from_optional_db_fields(
      &token,
      maybe_public_bucket_hash,
      maybe_prefix,
      maybe_extension,
    );

    assert_eq!(cover_image.maybe_cover_image_public_bucket_path, Some("/media/b/u/c/k/e/bucket_hash/image_bucket_hash.png".to_string()));
    assert_eq!(cover_image.default_cover.image_index, 18);
  }
}
