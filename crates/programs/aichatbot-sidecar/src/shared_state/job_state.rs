use async_openai::Client;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::app_control_state::AppControlState;
use fakeyou_client::fakeyou_api_client::FakeYouApiClient;
use sqlx::{Pool, Sqlite};
use std::sync::Arc;

#[derive(Clone)]
pub struct JobState {
  pub openai_client: Arc<Client>,
  pub fakeyou_client: Arc<FakeYouApiClient>,

  pub save_directory: SaveDirectory,
  pub sqlite_pool: Pool<Sqlite>,

  pub app_control_state: AppControlState,
}

