use std::sync::Arc;
use eframe::egui;
use log::{error, info};
use crate::shared_state::control_state::ControlState;

pub struct AppGui {
  // NB: This is not the authoritative set of state.
  // These will be copied into the shared server state.
  filename: String,
  default_directory: String,
  is_paused: bool,

  control_state: Arc<ControlState>,
}

impl AppGui {
  pub fn new(control_state: Arc<ControlState>) -> Self {
    Self {
      filename: "".to_string(),
      default_directory: "".to_string(),
      is_paused: false,
      control_state,
    }
  }
}

impl eframe::App for AppGui {
  fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
    if let Err(e) = self.control_state.set_is_paused(self.is_paused) {
      error!("Couldn't set paused state: {:?}", e);
    }

    egui::CentralPanel::default().show(ctx, |ui| {
      ui.heading("AiChatBot Sidecar");
      ui.horizontal(|ui| {
        let name_label = ui.label("Filename: ");
        ui.text_edit_singleline(&mut self.filename)
            .labelled_by(name_label.id);
      });
      ui.horizontal(|ui| {
        let name_label = ui.label("Default directory: ");
        ui.text_edit_singleline(&mut self.default_directory)
            .labelled_by(name_label.id);
      });
      ui.horizontal(|ui| {
        let name_label = ui.label("Is Paused?: ");
        ui.checkbox(&mut self.is_paused, "Is Paused?")
            .labelled_by(name_label.id);
      });
    });
  }
}

