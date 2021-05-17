#[macro_use] extern crate serde_derive;

pub mod server_state;
pub mod endpoints;
pub mod queries;

use actix_cors::Cors;
use actix_http::http;
use log::{info};
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{HttpServer, web, HttpResponse, App};
use std::sync::Arc;
use crate::server_state::{ServerState, EnvConfig};
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use crate::queries::badges::NewBadge;
use crate::endpoints::users::create_account::create_account_handler;

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";
const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info";

pub type AnyhowResult<T> = anyhow::Result<T>;

//pub async fn main() -> AnyhowResult<()> {
//#[tokio::main]
//#[async_std::main]
//#[actix_web::main]
//pub async fn main() -> std::io::Result<()> {
#[actix_web::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  let server_hostname = hostname::get()
    .ok()
    .and_then(|h| h.into_string().ok())
    .unwrap_or("storyteller-web-unknown".to_string());

  let db_connection_string = "mysql://root:root@localhost/storyteller";

  let pool = MySqlPoolOptions::new()
    .max_connections(5)
    .connect(db_connection_string)
    .await?;

  let server_state = ServerState {
    env_config: EnvConfig {
      num_workers: 4,
      bind_address: DEFAULT_BIND_ADDRESS.to_string(),
    },
    hostname: server_hostname,
    mysql_pool: pool,
  };

  serve(server_state)
    .await?;
  Ok(())
}

//#[actix_web::main]
pub async fn serve(server_state: ServerState) -> AnyhowResult<()>
{
  let bind_address = server_state.env_config.bind_address.clone();
  let num_workers = server_state.env_config.num_workers.clone();
  let hostname = server_state.hostname.clone();

  let server_state_arc = web::Data::new(Arc::new(server_state));

  info!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || {
    let mut app = App::new()
      .wrap(Cors::default()
        .allowed_origin("http://api.vo.codes")
        .allowed_origin("http://jungle.horse")
        .allowed_origin("http://localhost:12345")
        .allowed_origin("http://localhost:3000")
        .allowed_origin("http://localhost:5555")
        .allowed_origin("http://localhost:7000")
        .allowed_origin("http://localhost:8000")
        .allowed_origin("http://localhost:8080")
        .allowed_origin("http://mumble.stream")
        .allowed_origin("http://trumped.com")
        .allowed_origin("http://vo.codes")
        .allowed_origin("http://vocodes.com")
        .allowed_origin("https://jungle.horse")
        .allowed_origin("https://mumble.stream")
        .allowed_origin("https://trumped.com")
        .allowed_origin("https://vo.codes")
        .allowed_origin("https://vocodes.com")
        .allowed_methods(vec!["GET", "POST", "OPTIONS"])
        .allowed_headers(vec![
          http::header::ACCEPT,
          http::header::ACCESS_CONTROL_ALLOW_ORIGIN, // Tabulator Ajax
          http::header::CONTENT_TYPE,
          http::header::HeaderName::from_static("x-requested-with") // Tabulator Ajax sends
        ])
        .max_age(3600))
      .wrap(Logger::new(&log_format)
        .exclude("/liveness")
        .exclude("/readiness"))
      .wrap(DefaultHeaders::new().header("X-Backend-Hostname", &hostname))
      .service(
        web::resource("/create_account")
          .route(web::post().to(create_account_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::scope("/foo")
          .service(
            web::resource("/bar")
              .route(web::get().to(|| HttpResponse::Ok()))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/bin")
              .route(web::get().to(|| HttpResponse::Ok()))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
      )
      .service(
        web::scope("/a")
          .service(
            web::resource("/b")
              .route(web::get().to(|| HttpResponse::Ok()))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
          .service(
            web::resource("/c")
              .route(web::get().to(|| HttpResponse::Ok()))
              .route(web::head().to(|| HttpResponse::Ok()))
          )
      );
      // Admin UI & old frontend
      //.service(Files::new("/frontend", admin_asset_directory.clone())
      //  .index_file("FAKE_INDEX.HTML"))
      //.service(Files::new("/adminui", admin_asset_directory.clone())
      //  .index_file("index.html"))
      // Early access static path for assets
      //.service(Files::new("/static", static_asset_directory.clone())
      //  .index_file("FAKE_INDEX.HTML"))
      /*.service(
        web::resource("/login")
          .route(web::post().to(login_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/logout")
          .route(web::post().to(logout_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(get_liveness)
      .service(get_models)
      .service(get_readiness)
      .service(get_root)
      .service(get_sentences)
      .service(get_service_settings)
      .service(get_speakers)
      .service(get_early_access_speakers)
      .service(get_dynamic_early_access_speakers)
      .service(get_words);*/

    app.app_data(server_state_arc.clone())
  })
    .bind(bind_address)?
    .workers(num_workers)
    .run()
    .await?;

  Ok(())
}

pub async fn create_user(pool: &MySqlPool) -> AnyhowResult<()> {
  let mut tx = pool.begin().await?;
  let todo = sqlx::query("INSERT INTO badges (slug, title, description, image_url) VALUES ($1, $2, $3, $4)")
    .bind("foo")
    .bind("bar")
    .bind("baz")
    .bind("bin")
    .fetch_one(&mut tx)
    .await?;

  tx.commit().await?;

  Ok(())
}
