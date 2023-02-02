use std::sync::Arc;
use crate::gui::gui::AppGui;
use eframe::egui;
use errors::AnyhowResult;
use crate::shared_state::control_state::ControlState;

pub fn launch_gui(control_state: Arc<ControlState>) -> AnyhowResult<()> {
  // Log to stdout (if you run with `RUST_LOG=debug`).
  //tracing_subscriber::fmt::init();

  let options = eframe::NativeOptions {
    initial_window_size: Some(egui::vec2(320.0, 240.0)),
    ..Default::default()
  };

  let app_state = AppGui::new(control_state);

  let result = eframe::run_native(
    "AiChatBot Sidecar",
    options,
    Box::new(|_cc| Box::new(app_state)),
  );

  Ok(())
}