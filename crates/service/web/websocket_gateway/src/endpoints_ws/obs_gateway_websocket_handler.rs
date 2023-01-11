use actix::prelude::*;
use actix_rt::Runtime;
use actix_web::web::Path;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use container_common::anyhow_result::AnyhowResult;
use container_common::thread::async_thread_kill_signal::AsyncThreadKillSignal;
use container_common::token::random_crockford_token::random_crockford_token;
use crate::endpoints_ws::helpers::publish_active_browser_info::publish_active_browser_info;
use crate::endpoints_ws::obs_gateway_websocket_handler::ResponseType::TtsEvent;
use crate::endpoints_ws::threads::redis_pubsub_event_listener_thread::RedisPubsubEventListenerThread;
use crate::endpoints_ws::threads::tts_inference_job_token_queue::TtsInferenceJobTokenQueue;
use crate::server_state::ObsGatewayServerState;
use database_queries::queries::twitch::twitch_oauth::find::{TwitchOauthTokenFinder, TwitchOauthTokenRecord};
use futures_timer::Delay;
use futures_util::FutureExt;
use http_server_common::error::common_server_error::CommonServerError;
use log::debug;
use log::error;
use log::info;
use log::warn;
use r2d2_redis::RedisConnectionManager;
use r2d2_redis::r2d2::PooledConnection;
use r2d2_redis::redis::Commands;
use redis_common::payloads::obs_active_payload::ObsActivePayload;
use redis_common::redis_keys::RedisKeys;
use redis_common::shared_constants::OBS_ACTIVE_TTL_SECONDS;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::Handle;
use tokio::task::JoinHandle;
use twitch_api2::pubsub::Topic;
use twitch_api2::pubsub::TopicData::ChannelPointsChannelV1;
use twitch_api2::pubsub::channel_bits::ChannelBitsEventsV2Reply::BitsEvent;
use twitch_api2::pubsub;
use twitch_common::twitch_user_id::TwitchUserId;

#[derive(Deserialize)]
pub struct PathInfo {
  twitch_username: String,
}

/// Sent back to the frontend websocket.
#[derive(Serialize, Copy, Clone)]
pub enum ResponseType {
  Pong,
  TtsEvent,
}

/// Sent back to the frontend websocket.
#[derive(Serialize)]
pub struct FrontendEventPayload {
  pub response_type: ResponseType,
  #[serde(skip_serializing_if = "Option::is_none")]
  pub tts_job_tokens: Option<Vec<String>>,
}

/// Endpoint
pub async fn obs_gateway_websocket_handler(
  path: Path<PathInfo>,
  http_request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>,
  stream: web::Payload,
) -> Result<HttpResponse, CommonServerError> {

  let mut finder = TwitchOauthTokenFinder::new()
      .allow_expired_tokens(true)
      .scope_twitch_username(Some(&path.twitch_username));

  let lookup_result = finder.perform_query(&server_state.backends.mysql_pool).await;

  let token_record = match lookup_result {
    Ok(Some(token_record)) => token_record,
    Ok(None) => {
      warn!("Could not find Twitch user: {}", &path.twitch_username);
      return Err(CommonServerError::NotFound);
    },
    Err(e) => {
      error!("MySQL Error: {}", e);
      return Err(CommonServerError::ServerError);
    },
  };

  let twitch_user_id = TwitchUserId::from_str(&token_record.twitch_user_id)
      .map_err(|e| {
        error!("Error converting twitch user id: {}, id= {}", e, &token_record.twitch_user_id);
        CommonServerError::ServerError
      })?;

  let mut redis = server_state.backends
      .redis_pool
      .get()
      .map_err(|err| {
        error!("Could not get Redis: {:?}", err);
        CommonServerError::ServerError
      })?;

  publish_active_browser_info(&mut redis, twitch_user_id.get_str())
      .map_err(|e| {
        error!("Error publishing active browser session: {:?}", e);
        CommonServerError::ServerError
      })?;

  let server_state_arc = server_state.get_ref().clone();

  info!("Building user Redis PubSub thread...");

  let async_thread_kill_signal
      = AsyncThreadKillSignal::new_with_ttl(Duration::from_secs(30)); // TODO

  let tts_job_token_queue = TtsInferenceJobTokenQueue::new();

  let thread = RedisPubsubEventListenerThread::new(
    &twitch_user_id,
    &server_state.backends.redis_pubsub_connection_string,
    tts_job_token_queue.clone(),
    async_thread_kill_signal.clone(),
  ).map_err(|e| {
    error!("Error creating pubsub thread: {:?}", e);
    CommonServerError::ServerError
  })?;

  info!("Starting user Redis PubSub thread...");

  let mut join_handle =
      server_state.multithreading.redis_pubsub_runtime.spawn(thread.start_thread());

  server_state.multithreading.redis_pubsub_runtime.spawn(
    eventually_kill(
      join_handle,
      async_thread_kill_signal.clone(),
      twitch_user_id.clone()));

  let websocket = ObsGatewayWebSocket::new(
    tts_job_token_queue,
    twitch_user_id.clone(),
    server_state_arc,
    async_thread_kill_signal
  );

  info!("Begin Javascript WebSocket...");

  ws::start(websocket, &http_request, stream)
      .map_err(|e| {
        warn!("Websocket ws::start() error: {}", e);
        CommonServerError::ServerError
      })
}

async fn eventually_kill(
  handle: JoinHandle<()>,
  async_thread_kill_signal: AsyncThreadKillSignal,
  twitch_user_id: TwitchUserId,
) {
  loop {
    if !async_thread_kill_signal.is_alive().unwrap() {
      warn!("Killing pubsub thread for user: {} (they may have multiple browser sessions)",
        twitch_user_id.get_str());
      handle.abort();
      return;
    }
    sleep(Duration::from_secs(10));
  }
}

/// Websocket behavior
struct ObsGatewayWebSocket {
  twitch_user_id: TwitchUserId,
  server_state: Arc<ObsGatewayServerState>,
  tts_job_token_queue: TtsInferenceJobTokenQueue,
  async_thread_kill_signal: AsyncThreadKillSignal,
}

impl Actor for ObsGatewayWebSocket {
  type Context = ws::WebsocketContext<Self>;

  fn started(&mut self, _ctx: &mut Self::Context) {
    info!("ObsGatewayWebSocket Actor::started()");
  }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ObsGatewayWebSocket {
  fn handle(
    &mut self,
    msg: Result<ws::Message, ws::ProtocolError>,
    ctx: &mut Self::Context,
  ) {
    if let Ok(msg) = msg {
      // NB: Keep the Redis PubSub thread alive.
      self.async_thread_kill_signal.bump_ttl().unwrap();

      //debug!("Socket Handler::handle(): msg = {:?}", msg);

      // TODO: Only send this every 60 seconds.
      // TODO: Error handling.
      // TODO: Reconnecting.

      // TODO: Fix unwraps.
      let mut redis = self.get_redis().unwrap();

      publish_active_browser_info(&mut redis, self.twitch_user_id.get_str())
          .map_err(|e| {
            error!("Error publishing active browser session: {:?}", e);
            CommonServerError::ServerError
          }).unwrap(); // TODO: Fixme

      // TODO: This should be done *BEFORE* PubSub
      self.write_obs_active().unwrap();

      // TODO: Error handling
      if let Some(tts_job_token) = self.tts_job_token_queue.dequeue_token().unwrap() {
        let tts_job_tokens = Some(vec![tts_job_token]);

        warn!("Sending job tokens: {:?}", tts_job_tokens);

        let payload = FrontendEventPayload {
          response_type: TtsEvent,
          tts_job_tokens,
        };

        match serde_json::to_string(&payload) {
          Ok(json) => ctx.text(json),
          Err(e) => {
            error!("Error with JSON payload: {:?}", e);
          }
        }

        return;
      }

      match msg {
        ws::Message::Ping(bytes) => {
          //debug!("Socket Handler::handle(): got ping");
          ctx.pong(&bytes)
        },
        ws::Message::Text(text) => {
          //debug!("Socket Handler::handle(): got text = {:?}", text);

          let payload = FrontendEventPayload {
            response_type: ResponseType::Pong,
            tts_job_tokens: None,
          };

          match serde_json::to_string(&payload) {
            Ok(json) => {
              ctx.text(json);
            },
            Err(e) => {
              error!("Error with JSON PONG payload: {:?}", e);
            }
          }

          //ctx.text("response")
        },
        ws::Message::Binary(bin) => {
          //debug!("Socket Handler::handle(): got binary...");
          //ctx.binary("response".as_bytes())
        },
        ws::Message::Close(reason) => {
          warn!("Socket Handler::handle(): got close, reason = {:?}", reason);
          ctx.close(reason);
          ctx.stop();
          warn!("Marking PubSub thread for death.");
          self.async_thread_kill_signal.mark_thread_for_kill().unwrap();
        }
        _ => {}
      }
    } else {
      ctx.stop();
    }
  }
}

impl ObsGatewayWebSocket {
  fn new(
    tts_job_token_queue: TtsInferenceJobTokenQueue,
    twitch_user_id: TwitchUserId,
    server_state: Arc<ObsGatewayServerState>,
    async_thread_kill_signal: AsyncThreadKillSignal,
  ) -> Self {
    Self {
      tts_job_token_queue,
      twitch_user_id,
      server_state,
      async_thread_kill_signal,
    }
  }

  fn get_redis(&self)
    -> AnyhowResult<PooledConnection<RedisConnectionManager>>
  {
    let redis = self.server_state.backends
        .redis_pool
        .get()
        .map_err(|err| {
          error!("Could not get Redis: {:?}", err);
          CommonServerError::ServerError
        }).unwrap(); // TODO: FIXME

    Ok(redis)
  }

  fn write_obs_active(&self) -> AnyhowResult<()> {
    let mut redis = self.get_redis().unwrap();
    let redis_key = RedisKeys::obs_active_session_keepalive(self.twitch_user_id.get_str());
    let _r : bool = redis.set_ex(redis_key, "1", OBS_ACTIVE_TTL_SECONDS)
        .map_err(|e| {
          warn!("redis error: {:?}", e);
          CommonServerError::ServerError
        }).unwrap(); // TODO: Fixme

    Ok(())
  }
}

