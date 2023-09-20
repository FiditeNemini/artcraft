use std::sync::Arc;

use async_openai::Client;
use sqlx::{Pool, Sqlite};

use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::app_control_state::AppControlState;

#[derive(Clone)]
pub struct ServerState {
  pub app_control_state: Arc<AppControlState>,
  pub openai_client: Arc<Client>,
  pub save_directory: SaveDirectory,
  pub sqlite_pool: Pool<Sqlite>,
}
