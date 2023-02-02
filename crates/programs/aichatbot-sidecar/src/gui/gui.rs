use eframe::egui;

pub struct AppGui {
  filename: String,
  default_directory: String,
}

impl Default for AppGui {
  fn default() -> Self {
    Self {
      filename: "".to_string(),
      default_directory: "".to_string(),
    }
  }
}

impl eframe::App for AppGui {
  fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
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
    });
  }
}

