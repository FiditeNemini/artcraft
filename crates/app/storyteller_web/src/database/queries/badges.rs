use sqlx::MySqlPool;
use crate::AnyhowResult;

pub struct NewBadge {
  pub slug: String,
  pub title: String,
  pub description: String,
  pub image_url: String,
}

impl NewBadge {
  pub async fn insert(&self, pool: &MySqlPool) -> AnyhowResult<u64> {
    let record_id = sqlx::query!(
        r#"
INSERT INTO badges ( slug, title, description, image_url )
VALUES ( ?, ?, ?, ? )
        "#,
        self.slug,
        self.title,
        self.description,
        self.image_url,
    )
      .execute(pool)
      .await?
      .last_insert_id();

    Ok(record_id)
  }
}
