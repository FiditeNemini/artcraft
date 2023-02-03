// NB: The following windows directive is cargo-culted from:
// https://github.com/emilk/egui/blob/master/examples/hello_world/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release

pub mod gui;
pub mod jobs;
pub mod main_loop;
pub mod persistence;
pub mod shared_state;
pub mod startup_args;
pub mod web_server;

#[macro_use] extern crate serde_derive;

use actix_web::{HttpResponse, HttpServer, web};
use async_openai::Client;
use clap::{App, Arg};
use crate::gui::launch_gui::launch_gui;
use crate::main_loop::main_loop;
use crate::shared_state::control_state::ControlState;
use crate::startup_args::get_startup_args;
use crate::web_server::launch_web_server::launch_web_server;
use errors::AnyhowResult;
use log::info;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tokio::runtime::Runtime;

#[actix_web::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some("info"));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();

  let startup_args = get_startup_args()?;

  let control_state = Arc::new(ControlState::new());

  let openai_client = Arc::new(Client::new()
      .with_api_key(startup_args.openai_secret_key.clone()));


  let tokio_runtime = Runtime::new()?;

  info!("Starting async processes...");

  tokio_runtime.spawn(async {
    let _r = main_loop().await;
  });

  info!("Starting web server...");

  let control_state2 = control_state.clone();
  let openai_client2 = openai_client.clone();

  thread::spawn(move || {
    let server_future = launch_web_server(
      control_state2,
      openai_client2,
    );
    actix_web::rt::System::new().block_on(server_future)
  });

  info!("Starting GUI ...");

  let _r = launch_gui(startup_args.clone(), control_state.clone());

  Ok(())
}
