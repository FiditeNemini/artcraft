use tokens::tokens::tags::TagToken;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
pub struct TagInfo {
  pub token: TagToken,
  pub value: String,
}
