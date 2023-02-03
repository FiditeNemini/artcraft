use crate::gui::gui::{AppGui, AppGuiArgs};
use crate::shared_state::control_state::ControlState;
use crate::startup_args::StartupArgs;
use eframe::egui;
use errors::AnyhowResult;
use std::sync::Arc;

pub fn launch_gui(startup_args: StartupArgs, control_state: Arc<ControlState>) -> AnyhowResult<()> {
  // Log to stdout (if you run with `RUST_LOG=debug`).
  //tracing_subscriber::fmt::init();

  let options = eframe::NativeOptions {
    initial_window_size: Some(egui::vec2(320.0, 240.0)),
    ..Default::default()
  };

  let app_state = AppGui::new(AppGuiArgs {
    save_directory: startup_args.save_directory,
    control_state,
  });

  let result = eframe::run_native(
    "AiChatBot Sidecar",
    options,
    Box::new(|_cc| Box::new(app_state)),
  );

  Ok(())
}