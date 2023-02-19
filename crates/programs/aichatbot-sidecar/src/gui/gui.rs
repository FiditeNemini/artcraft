use std::sync::Arc;
use eframe::egui;
use log::{error, info};
use crate::configs::fakeyou_voice_option::FakeYouVoiceOption;
use crate::shared_state::app_control_state::AppControlState;

/// Initial state for the GUI
pub struct AppGuiArgs {
  /// Where the program saves its database
  pub save_directory: String,

  /// Shared state with the HTTP server and workers.
  pub control_state: Arc<AppControlState>,
}

pub struct AppGui {
  // NB: This is not the authoritative set of state.
  // These will be copied into the shared server state.
  filename: String,
  default_directory: String,

  is_unreal_paused : bool,
  is_scraping_paused: bool,
  is_openai_paused: bool,
  is_fakeyou_paused: bool,

  fakeyou_voice: FakeYouVoiceOption,

  /// Shared state with the HTTP server and workers.
  control_state: Arc<AppControlState>,
}

impl AppGui {
  pub fn new(args: AppGuiArgs) -> Self {
    Self {
      filename: "".to_string(),
      default_directory: args.save_directory,
      is_unreal_paused: false,
      is_scraping_paused: false,
      is_openai_paused: false,
      is_fakeyou_paused: false,
      fakeyou_voice: FakeYouVoiceOption::HanashiV2,
      control_state: args.control_state,
    }
  }
}

impl eframe::App for AppGui {
  fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
    //if let Err(e) = self.control_state.set_is_paused(self.is_paused) {
    //  error!("Couldn't set paused state: {:?}", e);
    //}

    self.control_state.set_is_unreal_paused(self.is_unreal_paused);
    self.control_state.set_is_scraping_paused(self.is_scraping_paused);
    self.control_state.set_is_openai_paused(self.is_openai_paused);
    self.control_state.set_is_fakeyou_paused(self.is_fakeyou_paused);

    let _r = self.control_state.set_fakeyou_voice(self.fakeyou_voice); // NB: Ignore lock errors.

    egui::CentralPanel::default().show(ctx, |ui| {
      //ui.heading("AiChatBot Sidecar");
      //ui.horizontal(|ui| {
      //  let name_label = ui.label("Filename: ");
      //  ui.text_edit_singleline(&mut self.filename)
      //      .labelled_by(name_label.id);
      //});
      //ui.horizontal(|ui| {
      //  let name_label = ui.label("Default directory: ");
      //  ui.text_edit_singleline(&mut self.default_directory)
      //      .labelled_by(name_label.id);
      //});

      //ui.horizontal(|ui| {
      //  let name_label = ui.label("Is Paused?: ");
      //  ui.checkbox(&mut self.is_paused, "Is Paused?")
      //      .labelled_by(name_label.id);
      //});

      ui.add_space(10.0);
      ui.heading("Sidecar Pause Controls");
      ui.add_space(7.0);

      ui.horizontal(|ui| {
        ui.checkbox(&mut self.is_scraping_paused, "Web Scraping");
      });
      ui.horizontal(|ui| {
        ui.checkbox(&mut self.is_openai_paused, "OpenAI API");
      });
      ui.horizontal(|ui| {
        ui.checkbox(&mut self.is_fakeyou_paused, "FakeYou API");
      });

      ui.add_space(20.0);
      ui.heading("Unreal Pause Controls");
      ui.add_space(7.0);
      ui.horizontal(|ui| {
        ui.checkbox(&mut self.is_unreal_paused, "TODO: This does not work yet.");
      });

      ui.add_space(20.0);
      ui.heading("FakeYou Voice");
      ui.add_space(7.0);

      egui::ComboBox::from_label("Note: once a story is generated, it will not be re-voiced!")
          .selected_text(format!("{:?}", self.fakeyou_voice))
          .show_ui(ui, |ui| {
            ui.selectable_value(&mut self.fakeyou_voice, FakeYouVoiceOption::HanashiV2, FakeYouVoiceOption::HanashiV2.variant_name());
            ui.selectable_value(&mut self.fakeyou_voice, FakeYouVoiceOption::JohnMadden, FakeYouVoiceOption::JohnMadden.variant_name());
          });

      ui.add_space(30.0);
    });
  }
}
