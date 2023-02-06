// NB: The following windows directive is cargo-culted from:
// https://github.com/emilk/egui/blob/master/examples/hello_world/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release

pub mod gui;
pub mod main_loop;
pub mod persistence;
pub mod shared_state;
pub mod startup_args;
pub mod web_server;
pub mod workers;

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
use enums::by_table::web_scraping_targets::web_content_type::WebContentType;
use sqlite_queries::queries::by_table::web_scraping_targets::insert_web_scraping_target::{Args, insert_web_scraping_target};
use web_scrapers::sites::cnn::cnn_article_scraper::cnn_article_scraper;
use web_scrapers::sites::cnn::cnn_indexer::cnn_scraper_test;
use web_scrapers::sites::techcrunch::techcrunch_article_scraper::techcrunch_article_scraper;
use web_scrapers::sites::theguardian::theguardian_scraper::theguardian_scraper_test;
use workers::web_content_scraping::ingest_url_scrape_and_save::ingest_url_scrape_and_save;
use crate::shared_state::job_state::JobState;
use crate::workers::web_index_ingestion::main_loop::web_index_ingestion_main_loop;

#[tokio::main]
pub async fn main2() -> AnyhowResult<()> {
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
  //let result = techcrunch_article_scraper("https://techcrunch.com/2023/02/04/elon-musk-says-twitter-will-provide-a-free-write-only-api-to-bots-providing-good-content/").await?;

  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();
  let startup_args = get_startup_args()?;
  let save_directory = SaveDirectory::new(&startup_args.save_directory);

  let url = "https://techcrunch.com/2023/02/04/elon-musk-says-twitter-will-provide-a-free-write-only-api-to-bots-providing-good-content/";
  ingest_url_scrape_and_save(url, WebContentType::TechCrunchArticle, &save_directory).await?;



  Ok(())
}

#[actix_web::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some("info"));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();

  let startup_args = get_startup_args()?;

  let app_control_state = Arc::new(AppControlState::new());

  let openai_client = Arc::new(Client::new()
      .with_api_key(startup_args.openai_secret_key.clone()));

  let save_directory = SaveDirectory::new(&startup_args.save_directory);

  let database_url = easyenv::get_env_string_required("DATABASE_URL")?;
  let pool = SqlitePoolOptions::new()
      .max_connections(5)
      .connect(&database_url).await?;

  let job_state = Arc::new(JobState {
    sqlite_pool: pool,
    save_directory: save_directory.clone(),
  });

  info!("Starting web server...");

  let app_control_state2 = app_control_state.clone();
  let openai_client2 = openai_client.clone();
  let job_state2 = job_state.clone();

  // NB: both egui and imgui (which we aren't using) complain about launching on a non-main thread.
  // They even complain that this is impossible on Windows (and our program aims to be multiplatform)
  // Thus, we launch everything else into its own thread. (TODO: Jobs + Server in one thread)
  thread::spawn(move || {
    let server_future = launch_web_server(LaunchWebServerArgs {
      app_control_state: app_control_state2,
      openai_client: openai_client2,
      save_directory,
    });

    let tokio_runtime = Runtime::new()?;

    tokio_runtime.spawn(async {
      let _r = web_index_ingestion_main_loop(job_state2).await;
    });

    let runtime = actix_web::rt::System::new();

    runtime.block_on(server_future)
  });

//  info!("Starting async processes...");
//
//  thread::spawn(move|| {
//
//    tokio_runtime.block_on(async || {
//      loop {
//        thread::sleep(Duration::from_secs(60))
//        std::future::
//      }
//    }.await)
//  });

  info!("Starting GUI ...");

  let _r = launch_gui(startup_args.clone(), app_control_state.clone());

  Ok(())
}
