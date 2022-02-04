use actix::prelude::*;
use actix_rt::Runtime;
use actix_web::web::Path;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use container_common::anyhow_result::AnyhowResult;
use container_common::token::random_crockford_token::random_crockford_token;
use crate::redis::constants::OBS_ACTIVE_TTL_SECONDS;
use crate::redis::obs_active_payload::ObsActivePayload;
use crate::server_state::ObsGatewayServerState;
use crate::twitch::pubsub::build_pubsub_topics_for_user::build_pubsub_topics_for_user;
use crate::twitch::twitch_user_id::TwitchUserId;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use database_queries::twitch_oauth::find::{TwitchOauthTokenFinder, TwitchOauthTokenRecord};
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
use redis_common::redis_keys::RedisKeys;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::Handle;
use twitch_api2::pubsub::Topic;
use twitch_api2::pubsub;
use twitch_api2::pubsub::channel_bits::ChannelBitsEventsV2Reply::BitsEvent;
use twitch_api2::pubsub::TopicData::ChannelPointsChannelV1;
use crate::endpoints_ws::obs_gateway_websocket_handler::ResponseType::TtsEvent;

// TODO: Redis calls are synchronous (but fast), but is there any way to make them async?

#[derive(Deserialize)]
pub struct PathInfo {
  twitch_username: String,
}

#[derive(Deserialize)]
pub struct QueryData {
  voice_token_1: Option<String>,
  voice_token_2: Option<String>,
  // Other preferences...
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

  let channel = RedisKeys::obs_active_sessions_topic();

  let payload = ObsActivePayload::new(&token_record.twitch_user_id);
  let json_payload = payload.serialize()
      .map_err(|e| {
        error!("Could not serialize JSON: {:?}", e);
        CommonServerError::ServerError
      })?;

  let _count_received : Option<u64> = redis.publish(channel, &json_payload)
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        CommonServerError::ServerError
      })?;

  info!("Begin Javascript WebSocket...");

  let server_state_arc = server_state.get_ref().clone();

  let websocket = ObsGatewayWebSocket::new(
    twitch_user_id.clone(),
    server_state_arc
  );

  ws::start(websocket, &http_request, stream)
      .map_err(|e| {
        warn!("Websocket error: {}", e);
        CommonServerError::ServerError
      })
}

/// Websocket behavior
struct ObsGatewayWebSocket {
  twitch_user_id: TwitchUserId,
  server_state: Arc<ObsGatewayServerState>,
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
    debug!("Socket Handler::handle()");

    if let Ok(msg) = msg {
      debug!("Socket Handler::handle(): msg = {:?}", msg);

      // TODO: Only send this every 60 seconds.
      // TODO: Error handling.
      // TODO: Reconnecting.

      let mut redis = self.server_state.backends
          .redis_pool
          .get()
          .map_err(|err| {
            error!("Could not get Redis: {:?}", err);
            CommonServerError::ServerError
          }).unwrap(); // TODO: FIXME

      let channel = RedisKeys::obs_active_sessions_topic();

      let payload = ObsActivePayload::new(self.twitch_user_id.get_str());

      let json_payload = payload.serialize()
          .map_err(|e| {
            error!("Could not serialize JSON: {:?}", e);
            CommonServerError::ServerError
          }).unwrap(); // TODO: FIXME

      let _count_received : Option<u64> = redis.publish(channel, &json_payload)
          .map_err(|e| {
            warn!("redis error: {:?}", e);
            CommonServerError::ServerError
          }).unwrap(); // TODO: Fixme

      // TODO: This should be done *BEFORE* PubSub
      self.write_obs_active().unwrap();

      let redis_key = RedisKeys::twitch_tts_job_queue(&self.twitch_user_id.get_str());
//      let values : Vec<String> = redis.lpop((&redis_key, 5)).unwrap(); // TODO: Error handling
//
//      if !values.is_empty() {
//        info!("Got {} TTS values", values.len());
//
//        let payload = FrontendEventPayload {
//          tts_job_tokens: values,
//        };
//
//        match serde_json::to_string(&payload) {
//          Ok(json) => {
//            ctx.text(json);
//          },
//          Err(e) => {
//            error!("Error with JSON payload: {:?}", e);
//          }
//        }
//      }

      let lookup_result : Option<String> = redis.lpop(&redis_key).unwrap(); // TODO: Error handling
      let mut values = Vec::new();

      if let Some(v) = lookup_result.as_deref() {
        values.push(v.to_string());
        let payload = FrontendEventPayload {
          response_type: TtsEvent,
          tts_job_tokens: Some(values),
        };

        match serde_json::to_string(&payload) {
          Ok(json) => {
            ctx.text(json);
          },
          Err(e) => {
            error!("Error with JSON payload: {:?}", e);
          }
        }
      }

      match msg {
        ws::Message::Ping(bytes) => {
          debug!("Socket Handler::handle(): got ping");
          ctx.pong(&bytes)
        },
        ws::Message::Text(text) => {
          debug!("Socket Handler::handle(): got text = {:?}", text);

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
          debug!("Socket Handler::handle(): got binary...");
          //ctx.binary("response".as_bytes())
        },
        ws::Message::Close(reason) => {
          warn!("Socket Handler::handle(): got close, reason = {:?}", reason);
          ctx.close(reason);
          ctx.stop();
        }
        _ => {}
      }
    } else {
      error!(">>>>>> obs streamhandler::STOP");
      ctx.stop();
    }
  }
}

impl ObsGatewayWebSocket {
  fn new(
    twitch_user_id: TwitchUserId,
    server_state: Arc<ObsGatewayServerState>,
  ) -> Self {
    Self {
      twitch_user_id,
      server_state,
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

