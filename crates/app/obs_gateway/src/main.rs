#![forbid(private_in_public)]
#![forbid(unused_must_use)]
//#![forbid(warnings)]

#![allow(dead_code)]
#![allow(non_snake_case)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]

#[macro_use] extern crate lazy_static;
#[macro_use] extern crate magic_crypt;
#[macro_use] extern crate serde_derive;

pub mod endpoints;
pub mod endpoints_ws;
pub mod server_state;
pub mod twitch;
pub mod util;

use actix_cors::Cors;
use actix_http::http;
use actix_web::middleware::{Logger, DefaultHeaders};
use actix_web::{HttpServer, web, HttpResponse, App};
use config::shared_constants::DEFAULT_MYSQL_CONNECTION_STRING;
use config::shared_constants::DEFAULT_REDIS_CONNECTION_STRING;
use config::shared_constants::DEFAULT_RUST_LOG;
use crate::endpoints::oauth_begin::oauth_begin_enroll;
use crate::endpoints::oauth_begin_redirect::oauth_begin_enroll_redirect;
use crate::endpoints::oauth_end::oauth_end_enroll_from_redirect;
use crate::endpoints_ws::obs_gateway_websocket_handler::obs_gateway_websocket_handler;
use crate::endpoints_ws::pubsub_gateway::ws_index;
use crate::server_state::{ObsGatewayServerState, EnvConfig, TwitchOauthSecrets, TwitchOauthTemp};
use crate::twitch::twitch_client_wrapper::TwitchClientWrapper;
use crate::twitch::twitch_secrets::TwitchSecrets;
use crate::twitch::websocket_client::PollingTwitchWebsocketClient;
use futures::Future;
use futures::executor::ThreadPool;
use http_server_common::cors::build_common_cors_config;
use http_server_common::endpoints::default_route_404::default_route_404;
use http_server_common::endpoints::root_index::get_root_index;
use limitation::Limiter;
use log::{info};
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2;
use r2d2_redis::redis::Commands;
use sqlx::MySqlPool;
use sqlx::mysql::MySqlPoolOptions;
use std::sync::Arc;
use std::time::Duration;
use twitch_api2::pubsub::Topic;
use twitch_api2::pubsub;
use twitch_oauth2::tokens::UserTokenBuilder;
use twitch_oauth2::{AppAccessToken, Scope, TwitchToken, tokens::errors::AppAccessTokenError, ClientId, ClientSecret};

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:54321";

pub type AnyhowResult<T> = anyhow::Result<T>;

#[actix_web::main]
//#[tokio::main]
async fn main() -> AnyhowResult<()> {
  easyenv::init_all_with_default_logging(Some(DEFAULT_RUST_LOG));

  // NB: Do not check this secrets-containing dotenv file into VCS.
  // This file should only contain *development* secrets, never production.
  let _ = dotenv::from_filename(".env-secrets").ok();

  info!("Obtaining hostname...");

  let server_hostname = hostname::get()
      .ok()
      .and_then(|h| h.into_string().ok())
      .unwrap_or("obs-gateway-server-unknown".to_string());

  info!("Hostname: {}", &server_hostname);

  info!("Reading Twitch secrets...");

  let secrets = TwitchSecrets::from_file("twitch_secrets.toml")?;
  let client_id = ClientId::new(&secrets.app_client_id);
  let client_secret = ClientSecret::new(&secrets.app_client_secret);


  // ========================================================

// TODO: Temp comment out to debug actix-web vs. runtime
//
  info!("Getting app access token...");

  //let scopes = Scope::all();
  let scopes = vec![
    Scope::BitsRead,
    Scope::UserReadEmail,
  ];

  let mut twitch_client = TwitchClientWrapper::new(client_id.clone(), client_secret.clone());
  twitch_client.request_access_token(scopes).await?;

  info!("Getting user id ...");

  //let user_id = twitch_client.get_user_id_from_username("testytest512").await?;
  let user_id = twitch_client.get_user_id_from_username("vocodes").await?;

  info!("User ID: {}", user_id);

  //std::thread::sleep(Duration::from_secs(5000));


//  // ==================== OAUTH FLOW ====================



//
//  let auth_token = user_token.access_token.as_str();
//
//  // ==================== PUBSUB SUBSCRIPTION AND MAIN LOOP ====================
//
//  let mut client = PollingTwitchWebsocketClient::new()?;
//
//  println!("Connecting PubSub...");
//  client.connect().await?;
//
//  println!("Connected");
//
//  //println!("Starting polling thread...");
//  //client.start_ping_thread().await;
//
//  println!("Sending PING...");
//
//  client.send_ping().await?;
//
//  println!("Try read next...");
//  let r = client.try_next().await?;
//  println!("Result: {:?}", r);
//
//
//  println!("Begin LISTEN...");
//
//  let bit_topic = pubsub::channel_bits::ChannelBitsEventsV2 {
//    channel_id: user_id,
//  }.into_topic();
//
//  let topics = [bit_topic];
//
//  client.listen(&auth_token, &topics).await?;
//
//  println!("Try read next...");
//  let r = client.try_next().await?;
//  println!("Result: {:?}", r);
//
//  /*
//  Result: Some(Message { data: ChannelBitsEventsV2 { topic: ChannelBitsEventsV2 {
//  channel_id: 652567283 }, reply: BitsEvent { data: BitsEventData { badge_entitlement:
//  Some(BadgeEntitlement { new_version: 100, previous_version: 1 }), bits_used: 100,
//  channel_id: "652567283", channel_name: "vocodes", chat_message: "Cheer100 testing the cheer",
//  context: Cheer, is_anonymous: false, time: "2021-09-27T04:30:53.627717085Z",
//  total_bits_used: 101, user_id: "650154491", user_name: "testytest512" },
//  message_id: "793f745e-8f3e-5f71-bc41-4808c4b49a53", version: "1.0", is_anonymous: false } } })
//
//  Result: Some(Message { data: ChannelBitsEventsV2 { topic: ChannelBitsEventsV2 {
//  channel_id: 652567283 }, reply: BitsEvent { data: BitsEventData { badge_entitlement: None,
//  bits_used: 1, channel_id: "652567283", channel_name: "vocodes",
//  chat_message: "mario: hello everybody Cheer1", context: Cheer, is_anonymous: false,
//  time: "2021-09-27T04:47:32.943872952Z", total_bits_used: 102, user_id: "650154491",
//  user_name: "testytest512" }, message_id: "5844328d-495b-5585-9d6c-3c99949f9a0a", version: "1.0",
//  is_anonymous: false } } })
//   */
//
//
//
//  println!("Try read next...");
//  let r = client.try_next().await?;
//  println!("Result: {:?}", r);
//
//  println!("Sleep...");
//  std::thread::sleep(Duration::from_millis(30000));
//
//  //let text = msg.into_text()?;
//  //println!("Text: {}", text);
//
//  // ========================================================

//  info!("Connecting to database...");
//
//  let db_connection_string =
//      easyenv::get_env_string_or_default(
//        "MYSQL_URL",
//        DEFAULT_MYSQL_CONNECTION_STRING);
//
//  let redis_connection_string =
//      easyenv::get_env_string_or_default(
//        "REDIS_URL",
//        DEFAULT_REDIS_CONNECTION_STRING);
//
//  let pool = MySqlPoolOptions::new()
//      .max_connections(5)
//      .connect(&db_connection_string)
//      .await?;
//
//  let redis_manager = RedisConnectionManager::new(redis_connection_string.clone())?;
//
//  let redis_pool = r2d2::Pool::builder()
//      .build(redis_manager)?;

  info!("Reading env vars and setting up utils...");

  let bind_address = easyenv::get_env_string_or_default("BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("NUM_WORKERS", 8)?;
  let hmac_secret = easyenv::get_env_string_or_default("COOKIE_SECRET", "notsecret");
  let cookie_domain = easyenv::get_env_string_or_default("COOKIE_DOMAIN", ".vo.codes");
  let cookie_secure = easyenv::get_env_bool_or_default("COOKIE_SECURE", true);
  let cookie_http_only = easyenv::get_env_bool_or_default("COOKIE_HTTP_ONLY", true);
  let website_homepage_redirect =
      easyenv::get_env_string_or_default("WEBSITE_HOMEPAGE_REDIRECT", "https://vo.codes/");

  let oauth_redirect_url = easyenv::get_env_string_or_default(
    "TWITCH_OAUTH_REDIRECT_URL",
    "http://localhost:54321/twitch/oauth_redirect");

  // TODO: These are temporary.
  let temp_oauth_user_id = easyenv::get_env_string_or_default("TEMP_TWITCH_OAUTH_USER_ID", "");
  let temp_oauth_access_token = easyenv::get_env_string_or_default("TEMP_TWITCH_OAUTH_ACCESS", "");
  let temp_oauth_refresh_token = easyenv::get_env_string_or_default("TEMP_TWITCH_OAUTH_REFRESH", "");

  let server_state = ObsGatewayServerState {
    env_config: EnvConfig {
      num_workers,
      bind_address,
      cookie_domain,
      cookie_secure,
      cookie_http_only,
      website_homepage_redirect,
    },
    twitch_oauth_secrets: TwitchOauthSecrets {
      client_id: secrets.app_client_id.clone(),
      client_secret: secrets.app_client_secret.clone(),
      redirect_url: oauth_redirect_url,
    },
    twitch_oauth_temp: TwitchOauthTemp {
      temp_oauth_user_id,
      temp_oauth_access_token,
      temp_oauth_refresh_token,
    },
    hostname: server_hostname,
  };

  serve(server_state)
      .await?;
  Ok(())
}

pub async fn serve(server_state: ObsGatewayServerState) -> AnyhowResult<()>
{
  let bind_address = server_state.env_config.bind_address.clone();
  let num_workers = server_state.env_config.num_workers.clone();
  let hostname = server_state.hostname.clone();

  let server_state_arc = web::Data::new(Arc::new(server_state));

  info!("Starting HTTP service.");

  let log_format = "[%{HOSTNAME}e] %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || {
    App::new()
        .app_data(server_state_arc.clone())
        .wrap(build_common_cors_config())
        .wrap(Logger::new(&log_format)
            .exclude("/liveness")
            .exclude("/readiness"))
        .wrap(DefaultHeaders::new()
            .header("X-Backend-Hostname", &hostname)
            .header("X-Build-Sha", ""))
        .service(web::resource("/")
            .route(web::get().to(get_root_index))
        )
        // Twitch
        .service(web::scope("/twitch")
              .service(web::resource("/oauth_enroll")
                    .route(web::get().to(oauth_begin_enroll))
                    .route(web::head().to(|| HttpResponse::Ok()))
              )
              .service(web::resource("/oauth_enroll_redirect")
                  .route(web::get().to(oauth_begin_enroll_redirect))
                  .route(web::head().to(|| HttpResponse::Ok()))
              )
              .service(web::resource("/oauth_redirect")
                    .route(web::get().to(oauth_end_enroll_from_redirect))
                    .route(web::head().to(|| HttpResponse::Ok()))
              )
              .service(web::resource("/websocket")
                    .route(web::get().to(ws_index))
                    .route(web::head().to(|| HttpResponse::Ok()))
              )
        )
        .service(web::resource("/obs")
            .route(web::get().to(obs_gateway_websocket_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
        )
        .service(
          actix_files::Files::new("/static", "static")
              .show_files_listing()
              .use_last_modified(true),
        )
    //.default_service( web::route().to(default_route_404))
  })
      .bind(bind_address)?
      .workers(num_workers)
      .run()
      .await?;

  Ok(())
}
