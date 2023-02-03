use async_openai::Client;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::app_control_state::AppControlState;
use std::sync::Arc;

#[derive(Clone)]
pub struct ServerState {
  pub app_control_state: Arc<AppControlState>,
  pub openai_client: Arc<Client>,
  pub save_directory: SaveDirectory,
}
