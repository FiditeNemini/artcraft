use std::sync::Arc;
use crate::shared_state::control_state::ControlState;

#[derive(Clone)]
pub struct ServerState {
  pub control_state: Arc<ControlState>,
}
