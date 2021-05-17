use actix_web::{Responder, web};

#[derive(Deserialize)]
pub struct CreateAccountRequest {
  pub username: String,
  pub password: String,
  pub password_verification: String,
}

#[derive(Serialize)]
pub struct CreateAccountResponse {
  pub success: bool,

}

//request: web::Json<CreateAccountRequest>
pub async fn create_account_handler() -> impl Responder {

  /*let record_id = sqlx::query!(
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

  Ok(record_id)*/



  web::Json(CreateAccountResponse {
    success: true,
  })
}