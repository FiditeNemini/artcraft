use serde_derive::Deserialize;
use url::Url;

/// Cover image links can only be jpg, png, etc. No videos.
#[derive(Deserialize)]
pub struct CoverImageLinks {
  /// Primary link to the cover image via the CDN.
  pub cdn_url: Url,

  /// Template to construct thumbnail URLs.
  /// Replace the string `{WIDTH}` with the desired width.
  /// Only relevant for image media files. (Video media files instead have
  /// video previews, which, in turn, have their own thumbnail templates.)
  pub thumbnail_template: String,
}
