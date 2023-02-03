use async_openai::Client;
use crate::shared_state::control_state::ControlState;
use std::sync::Arc;

#[derive(Clone)]
pub struct ServerState {
  pub control_state: Arc<ControlState>,
  pub openai_client: Arc<Client>,
}
