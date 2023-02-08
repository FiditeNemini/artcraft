use async_openai::Client;
use crate::persistence::save_directory::SaveDirectory;
use sqlx::{Pool, Sqlite};
use std::sync::Arc;

#[derive(Clone)]
pub struct JobState {
  pub openai_client: Arc<Client>,
  pub save_directory: SaveDirectory,
  pub sqlite_pool: Pool<Sqlite>,
}

