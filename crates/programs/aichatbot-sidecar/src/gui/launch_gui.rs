use crate::gui::gui::AppGui;
use eframe::egui;
use errors::AnyhowResult;

pub fn launch_gui() -> AnyhowResult<()> {
  // Log to stdout (if you run with `RUST_LOG=debug`).
  //tracing_subscriber::fmt::init();

  let options = eframe::NativeOptions {
    initial_window_size: Some(egui::vec2(320.0, 240.0)),
    ..Default::default()
  };

  let result = eframe::run_native(
    "AiChatBot Sidecar",
    options,
    Box::new(|_cc| Box::new(AppGui::default())),
  );

  Ok(())
}