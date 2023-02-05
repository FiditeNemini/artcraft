// NB: The following windows directive is cargo-culted from:
// https://github.com/emilk/egui/blob/master/examples/hello_world/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release

pub mod gui;
pub mod ingestion;
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
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::app_control_state::AppControlState;
use crate::startup_args::get_startup_args;
use crate::web_server::launch_web_server::{launch_web_server, LaunchWebServerArgs};
use errors::AnyhowResult;
use log::info;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use sqlx::sqlite::SqlitePoolOptions;
use tokio::runtime::Runtime;
use sqlite_queries::queries::by_table::web_scraping_targets::insert_web_scraping_target::{Args, insert_web_scraping_target};
use web_scrapers::sites::cnn::cnn_article_scraper::cnn_article_scraper;
use web_scrapers::sites::cnn::cnn_indexer::cnn_scraper_test;
use web_scrapers::sites::techcrunch::techcrunch_article_scraper::techcrunch_article_scraper;
use web_scrapers::sites::techcrunch::techcrunch_scraper::techcrunch_scraper_test;
use web_scrapers::sites::theguardian::theguardian_scraper::theguardian_scraper_test;

#[tokio::main]
pub async fn main() -> AnyhowResult<()> {
  let database_url = easyenv::get_env_string_required("DATABASE_URL")?;
  let pool = SqlitePoolOptions::new()
      .max_connections(5)
      .connect(&database_url).await?;

  /*
  let mut targets = Vec::new();

  //let targets = techcrunch_scraper_test().await?;
  //let targets = theguardian_scraper_test().await?;

  targets.extend(cnn_scraper_test().await?);
  targets.extend(techcrunch_scraper_test().await?);
  targets.extend(theguardian_scraper_test().await?);

  for target in targets.iter() {
    //println!("\n\nTarget: {:?}", target);

    let _r = insert_web_scraping_target(Args {
      canonical_url: &target.canonical_url,
      web_content_type: target.web_content_type,
      maybe_title: target.maybe_title.as_deref(),
      maybe_article_full_image_url: target.maybe_full_image_url.as_deref(),
      maybe_article_thumbnail_image_url: target.maybe_thumbnail_image_url.as_deref(),
      sqlite_pool: &pool,
    }).await;
  }
  */

  //let _r = cnn_article_scraper("https://www.cnn.com/2023/02/02/tech/first-generation-iphone-auction/index.html").await?;
  let result = techcrunch_article_scraper("https://techcrunch.com/2023/02/04/elon-musk-says-twitter-will-provide-a-free-write-only-api-to-bots-providing-good-content/").await?;

  println!("Result: {:?}", result);


  Ok(())
}

#[actix_web::main]
pub async fn main2() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some("info"));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();

  let startup_args = get_startup_args()?;

  let app_control_state = Arc::new(AppControlState::new());

  let openai_client = Arc::new(Client::new()
      .with_api_key(startup_args.openai_secret_key.clone()));

  let tokio_runtime = Runtime::new()?;

  let save_directory = SaveDirectory::new(&startup_args.save_directory);

  info!("Starting async processes...");

  tokio_runtime.spawn(async {
    let _r = main_loop().await;
  });

  info!("Starting web server...");

  let app_control_state2 = app_control_state.clone();
  let openai_client2 = openai_client.clone();

  thread::spawn(move || {
    let server_future = launch_web_server(LaunchWebServerArgs {
      app_control_state: app_control_state2,
      openai_client: openai_client2,
      save_directory,
    });
    actix_web::rt::System::new().block_on(server_future)
  });

  info!("Starting GUI ...");

  let _r = launch_gui(startup_args.clone(), app_control_state.clone());

  Ok(())
}
