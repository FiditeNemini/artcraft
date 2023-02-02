// NB: The following windows directive is cargo-culted from:
// https://github.com/emilk/egui/blob/master/examples/hello_world/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release

pub mod gui;
pub mod jobs;
pub mod main_loop;
pub mod state;
pub mod web_server;

#[macro_use] extern crate serde_derive;

use std::thread;
use std::time::Duration;
use tokio::runtime::Runtime;
//use actix_rt::Runtime;
use actix_web::{HttpResponse, HttpServer, web};
use clap::{App, Arg};
use crate::main_loop::main_loop;
use errors::AnyhowResult;
use log::info;
use crate::gui::launch_gui::launch_gui;
use crate::gui::launch_imgui::launch_imgui;
use crate::web_server::get_next_audio_file_handler::get_next_audio_file_handler;
use crate::web_server::launch_web_server::launch_web_server;


//#[tokio::main]
#[actix_web::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some("info"));

  //let matches = App::new("aichatbot-sidecar")
  //    .arg(Arg::with_name("file")
  //        .short("f")
  //        .long("file")
  //        .value_name("FILE")
  //        .help("Packet file to read")
  //        .takes_value(true))
  //    .arg(Arg::with_name("host")
  //        .short("h")
  //        .long("host")
  //        .value_name("HOST")
  //        .help("Host and port to send traffic to")
  //        .takes_value(true))
  //    .get_matches();


  info!("Get runtime...");

  let tokio_runtime = Runtime::new()?;


  //info!("Starting main loop...");

  tokio_runtime.spawn(async {
    info!("STARTING MAIN LOOP...");
    let _r = main_loop().await;
  });

  info!("Launching GUI...");
  thread::spawn(|| {
    info!("LAUNCHING GUI...");
    let _r = launch_imgui();
  });


  //tokio_runtime.spawn(async {
  //  info!("LAUNCHING GUI...");
  //  let _r = launch_gui();
  //});

  info!("Starting web server...");

  //tokio_runtime.spawn(async move {
  //  info!("LAUNCHING WEBSERVER...");
  //  //let _r = launch_gui();
  //  let _r = launch_web_server().await;
  //});

  //thread::spawn(move || {
  //  info!("LAUNCHING WEBSERVER...");
  //  //tokio::runtime::Runtime::new().unwrap().block_on(async {
  //  tokio_runtime.block_on(async {
  //    let _r = launch_web_server().await;
  //  });
  //});


//  HttpServer::new(move || {
//    let app = actix_web::App::new();
//    //.app_data(web::Data::new(server_state_arc.firehose_publisher.clone()))
//
//    app.service(
//      web::resource("/next")
//          .route(web::get().to(get_next_audio_file_handler))
//          .route(web::head().to(|| HttpResponse::Ok()))
//    )
//  })
//      .bind("localhost:23333")?
//      .workers(8)
//      .run()
//      .await?;

  let _r = launch_web_server().await;

  loop {
    info!("Sleep");
    thread::sleep(Duration::from_secs(5));
  }

  Ok(())
}
