// NB: The following windows directive is cargo-culted from:
// https://github.com/emilk/egui/blob/master/examples/hello_world/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release

pub mod configs;
pub mod gpt_prompts;
pub mod gui;
pub mod persistence;
pub mod shared_state;
pub mod startup_args;
pub mod web_server;
pub mod workers;

#[macro_use] extern crate serde_derive;

use actix_web::{HttpResponse, HttpServer, web};
use async_openai::Client;
use async_openai::types::{CreateImageEditRequest, CreateImageRequest, ImageInput, ImageSize, ResponseFormat};
use clap::{App, Arg};
use crate::gui::launch_gui::launch_gui;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::app_control_state::AppControlState;
use crate::shared_state::job_state::JobState;
use crate::startup_args::get_startup_args;
use crate::web_server::launch_web_server::{launch_web_server, LaunchWebServerArgs};
use crate::workers::audio::fakeyou_audio_create::main_loop::fakeyou_audio_create_main_loop;
use crate::workers::audio::fakeyou_audio_download::main_loop::fakeyou_audio_download_main_loop;
use crate::workers::news_stories::phase_1::news_story_greenlighting::main_loop::news_story_greenlighting_main_loop;
use crate::workers::news_stories::phase_2::news_story_image_generation::main_loop::news_story_image_generation_main_loop;
use crate::workers::news_stories::phase_2::news_story_llm_category_summary::main_loop::news_story_llm_category_summary_main_loop;
use crate::workers::news_stories::phase_2::news_story_llm_rendition::main_loop::news_story_llm_rendition_main_loop;
use crate::workers::news_stories::phase_2::news_story_llm_title_summary::main_loop::news_story_llm_title_summary_main_loop;
use crate::workers::news_stories::phase_3::news_story_audio_preprocessing::main_loop::news_story_audio_preprocessing_main_loop;
use crate::workers::web::web_content_scraping::main_loop::web_content_scraping_main_loop;
use crate::workers::web::web_content_scraping::single_target::ingest_url_scrape_and_save::ingest_url_scrape_and_save;
use crate::workers::web::web_index_ingestion::main_loop::web_index_ingestion_main_loop;
use enums::common::sqlite::web_content_type::WebContentType;
use errors::AnyhowResult;
use fakeyou_client::credentials::FakeYouCredentials;
use fakeyou_client::fakeyou_api_client::FakeYouApiClient;
use log::info;
use sqlite_queries::queries::by_table::web_scraping_targets::insert_web_scraping_target::{Args, insert_web_scraping_target};
use sqlx::sqlite::SqlitePoolOptions;
use std::path::PathBuf;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tokio::runtime::{Builder, Runtime};
use web_scrapers::sites::cnn::cnn_article_scraper::cnn_article_scraper;
use web_scrapers::sites::techcrunch::techcrunch_article_scraper::techcrunch_article_scraper;
use web_scrapers::sites::theguardian::theguardian_indexer::theguardian_scraper_test;
use workers::news_stories::phase_4::news_story_audio_final_verification::main_loop::news_story_audio_final_verification_main_loop;
use workers::news_stories::phase_5::news_story_post_production_finalization::main_loop::news_story_post_production_finalization_main_loop;

//#[tokio::main]
//pub async fn main() -> AnyhowResult<()> {
//  test().await
//}

async fn test() -> AnyhowResult<()> {
  let database_url = easyenv::get_env_string_required("DATABASE_URL")?;
  let pool = SqlitePoolOptions::new()
      .max_connections(5)
      .connect(&database_url).await?;

  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();
  let startup_args = get_startup_args()?;
  let save_directory = SaveDirectory::new(&startup_args.save_directory);

  //let url = "https://techcrunch.com/2023/02/04/elon-musk-says-twitter-will-provide-a-free-write-only-api-to-bots-providing-good-content/";
  let url = "https://www.cnn.com/2023/02/04/business/automakers-problems-catching-up-with-tesla/index.html";
  ingest_url_scrape_and_save(url, WebContentType::CnnArticle, &save_directory).await?;

  let openai_client = Client::new()
      .with_api_key(startup_args.openai_secret_key.clone());

  let create_request = CreateImageRequest {
    n: Some(1),
    //prompt: "A news headline image; headline: After nearly one year of war, how Ukraine defied the odds — and may still defeat Russia".to_string(),
    //prompt: "A news headline image; headline: 'Heartbreaking': Visitor accidentally shatters Jeff Koons 'balloon dog' sculpture at Art Wynwood".to_string(),
    //prompt: "A news headline image; headline: Mayorkas goes on the offensive as GOP scrutiny builds, says it’s up to Congress to fix immigration system ".to_string(),
    //prompt: "Brave or lucky? See the moment a dog took on a hammerhead shark".to_string(),
    //prompt: "Headline: Jimmy Carter to begin receiving home hospice care".to_string(),
    //prompt: "Nine children hurt, shooting; Tragic, frightful, chaotic, violent, frightening.".to_string(),
    //prompt: "9 kids hurt in Georgia; Disturbing, tragic, frightening, violent, chaotic; Art Style/Director: Wes Anderson/Surrealist.; remove text; no text; no English text".to_string(),
    //prompt: "Summary: 9 kids hurt in Georgia; Adjectives: Disturbing, tragic, frightening, violent, chaotic; Art Style/Director: Wes Anderson/Surrealist.".to_string(),
    //prompt: "Reviving cheetahs in India. Adventurous, ambitious, necessary, daring, wild. Wes Anderson, Runnings fields with cheetahs racing around in the distance, trees swaying in the wind, and the sun setting in the background.".to_string(),
    prompt: "Closure found after WWII; moving, emotional, joyous, triumphant, proud.
Art style: Impressionism.
Setting: A coastal beach with a few people looking out to sea, with a large American flag waving in the background. Objects: a few boats in the distant, a lighthouse, and some driftwood on the shore. A photo or painting of this might be a peaceful beachscape with vibrant colors of the sky, sea, and flag.".to_string(),
    //prompt: "LGBTQ love, vibrant, colorful, playful, revolutionary. Art style: Bollywood musicals. Setting: A city street in the evening, lit up with vibrant neon signs and bustling crowds. There are couples in traditional Indian clothing, dancing and singing around colorful street vendors selling snacks and trinkets.".to_string(),
    //prompt: "Kinkade painting of Releasing twelve manatees: miraculous, astounding, incredible, remarkable, amazing. Setting: A peaceful beach, with gentle sand and a clear blue sky. Objects: A crowd of people lined up along the shore, a boat full of manatees, and the vibrant colors of the ocean.".to_string(),
    //prompt: "Photo of Releasing twelve manatees: miraculous, astounding, incredible, remarkable, amazing. Art style: Tim Burton.".to_string(),
    size: Some(ImageSize::S1024x1024),
    response_format: Some(ResponseFormat::Url),
    user: Some("test".to_string()),
  };

  let response = openai_client
      .images()
      .create(create_request)
      .await
      .unwrap();

//  let create_edit_request = CreateImageEditRequest {
//    image: ImageInput { path: PathBuf::from("runtime_data/scaled_test.png") },
//    mask: ImageInput { path: PathBuf::from("runtime_data/scaled_mask.png") },
//    prompt: "Closure found after WWII; moving, emotional, joyous, triumphant, proud.
//Art style: Impressionism.
//Setting: A coastal beach with a few people looking out to sea, with a large American flag waving in the background. Objects: a few boats in the distant, a lighthouse, and some driftwood on the shore. A photo or painting of this might be a peaceful beachscape with vibrant colors of the sky, sea, and flag.".to_string(),
//    n: Some(1),
//    size: Some(ImageSize::S1024x1024),
//    response_format: Some(ResponseFormat::Url),
//    user: Some("test".to_string()),
//  };
//
//  let response = openai_client
//      .images()
//      .create_edit(create_edit_request)
//      .await
//      .unwrap();


  println!("Response: {:?}", response);

  Ok(())
}

pub const LOG_LEVEL: &'static str = concat!(
  "info,",
  "actix_web=info,",
  "symphonia_core=warn,", // Symphonia is spammy af.
  "sqlx::query=warn,", // SQLX logs all queries as "info", which is super spammy
  "hyper::proto::h1::io=warn,",
  "http_server_common::request::get_request_ip=info," // Debug spams Rust logs
);

#[actix_web::main]
pub async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(LOG_LEVEL));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-aichatbot-secrets").ok();

  let startup_args = get_startup_args()?;

  // TODO: Fix this mess of Arc<T> wrapping other Arc<T> !
  let app_control_state_inner = AppControlState::new();
  let app_control_state = Arc::new(app_control_state_inner.clone());

  let openai_client = Client::new()
      .with_api_key(startup_args.openai_secret_key.clone())
      //.with_backoff(backoff::ExponentialBackoff)
      ;

  let openai_client = Arc::new(openai_client);

  let fakeyou_credentials = FakeYouCredentials::from_session_cookie_payload(
    &startup_args.fakeyou_session_cookie_payload);

  let fakeyou_client =
      Arc::new(FakeYouApiClient::make_production_client_from_credentials(fakeyou_credentials)?);

  let save_directory = SaveDirectory::new(&startup_args.save_directory);

  let database_url = easyenv::get_env_string_required("DATABASE_URL")?;

  let pool = SqlitePoolOptions::new()
      .max_connections(16)
      .connect(&database_url).await?;

  let pool2 = pool.clone(); // NB: Clone-safe.

  let job_state = Arc::new(JobState {
    openai_client: openai_client.clone(),
    fakeyou_client: fakeyou_client.clone(),
    save_directory: save_directory.clone(),
    sqlite_pool: pool,
    app_control_state: app_control_state_inner.clone(),
  });

  info!("Starting worker threads and web server...");

  let app_control_state2 = app_control_state.clone();
  let openai_client2 = openai_client.clone();

  // NB: both egui and imgui (which we aren't using) complain about launching on a non-main thread.
  // They even complain that this is impossible on Windows (and our program aims to be multiplatform)
  // Thus, we launch everything else into its own thread.
  thread::spawn(move || {
    let tokio_runtime = Builder::new_multi_thread()
        .worker_threads(16)
        .thread_name("tokio-worker")
        .thread_stack_size(3 * 1024 * 1024)
        .enable_time()
        .enable_io()
        .build()
        .unwrap();

    let job_state2 = job_state.clone();
    let job_state3 = job_state.clone();
    let job_state4 = job_state.clone();
    let job_state5 = job_state.clone();
    let job_state6 = job_state.clone();
    let job_state7 = job_state.clone();
    let job_state8 = job_state.clone();
    let job_state9 = job_state.clone();
    let job_state10 = job_state.clone();
    let job_state11 = job_state.clone();
    let job_state12 = job_state.clone();
    let job_state13 = job_state.clone();

    tokio_runtime.spawn(async {
      let _r = web_index_ingestion_main_loop(job_state2).await;
    });

    tokio_runtime.spawn(async {
      let _r = web_content_scraping_main_loop(job_state3).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_greenlighting_main_loop(job_state4).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_llm_rendition_main_loop(job_state5).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_llm_title_summary_main_loop(job_state12).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_llm_category_summary_main_loop(job_state13).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_audio_preprocessing_main_loop(job_state6).await;
    });

    tokio_runtime.spawn(async {
      let _r = fakeyou_audio_create_main_loop(job_state7).await;
    });

    tokio_runtime.spawn(async {
      let _r = fakeyou_audio_download_main_loop(job_state8).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_audio_final_verification_main_loop(job_state9).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_post_production_finalization_main_loop(job_state10).await;
    });

    tokio_runtime.spawn(async {
      let _r = news_story_image_generation_main_loop(job_state11).await;
    });

    // TODO: Final scheduling thread
    //tokio_runtime.spawn(async {
    //  // TODO...
    //});

    let server_future = launch_web_server(LaunchWebServerArgs {
      app_control_state: app_control_state2,
      openai_client: openai_client2,
      save_directory,
      sqlite_pool: pool2.clone(),
    });

    let runtime = actix_web::rt::System::new();

    runtime.block_on(server_future)
  });

  info!("Starting GUI ...");

  let _r = launch_gui(startup_args.clone(), app_control_state.clone());

  Ok(())
}
