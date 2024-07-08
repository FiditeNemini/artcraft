use utoipa::ToSchema;
use tokens::tokens::media_files::MediaFileToken;

/// Media File Token in URL PathInfo
#[derive(Deserialize, ToSchema)]
pub struct MediaFileTokenPathInfo {
  pub token: MediaFileToken,
}
