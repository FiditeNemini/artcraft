use actix::prelude::*;
use actix_rt::Runtime;
use actix_web::web::Path;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use container_common::token::random_crockford_token::random_crockford_token;
use crate::endpoints_ws::obs_twitch_thread::ObsTwitchThread;
use crate::server_state::ObsGatewayServerState;
use crate::twitch::oauth::oauth_token_refresher::OauthTokenRefresher;
use crate::twitch::polling_websocket_client::PollingTwitchWebsocketClient;
use crate::twitch::pubsub::build_pubsub_topics_for_user::build_pubsub_topics_for_user;
use crate::twitch::websocket_client::TwitchWebsocketClient;
use database_queries::twitch_oauth::find::{TwitchOauthTokenFinder, TwitchOauthTokenRecord};
use futures_timer::Delay;
use futures_util::FutureExt;
use http_server_common::error::common_server_error::CommonServerError;
use log::error;
use log::info;
use log::warn;
use r2d2_redis::redis::Commands;
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;
use tokio::runtime::Handle;
use twitch_api2::pubsub::Topic;
use twitch_api2::pubsub;
use redis_common::redis_keys::RedisKeys;

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

/// Endpoint
pub async fn obs_gateway_websocket_handler(
  path: Path<PathInfo>,
  http_request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>,
  stream: web::Payload,
) -> Result<HttpResponse, CommonServerError> {

  let mut finder = TwitchOauthTokenFinder::new()
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

  let user_id = token_record.twitch_user_id.parse::<u32>()
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

  let channel = RedisKeys::obs_session_active_topic();

  let _count_received : Option<u64> = redis.publish(channel, &token_record.twitch_user_id)
      .map_err(|e| {
        warn!("redis error: {:?}", e);
        CommonServerError::ServerError
      })?;

  let mut client = TwitchWebsocketClient::new().unwrap();
  let token_refresher = OauthTokenRefresher::new(
    user_id,
    &token_record.access_token,
    token_record.maybe_refresh_token.as_deref());

  info!("Connecting to Twitch PubSub...");
  client.connect().await.unwrap();

//  info!("Connected to Twitch PubSub");
//
//  info!("Sending Twitch PubSub PING...");
//  client.send_ping().await.unwrap();
//
//  info!("Try read next from Twitch PubSub...");
//  let r = client.try_next().await.unwrap();
//  info!("Twitch PubSub Result: {:?}", r);
//
//  info!("Begin TwitchPubSub LISTEN on authenticated OAuth topics...");
//  let topics = build_pubsub_topics_for_user(user_id);
//  client.listen(&auth_token, &topics).await.unwrap();

  //let (tx, rx) = crossbeam::channel::bounded(1);
  //let client = Arc::new(&self.twitch_client);
  //let client2 = client.clone();
  //let res = rx.recv().unwrap();

  info!("Begin Javascript WebSocket...");

  let server_state_arc = server_state.get_ref().clone();

  let websocket = ObsGatewayWebSocket::new(
    user_id,
    client,
    token_refresher,
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
  //twitch_client: PollingTwitchWebsocketClient,
  twitch_user_id: u32,
  twitch_thread: Arc<ObsTwitchThread>,
  server_state: Arc<ObsGatewayServerState>,
}

impl ObsGatewayWebSocket {
  fn new(
    twitch_user_id: u32,
    twitch_client: TwitchWebsocketClient,
    oauth_token_refresher: OauthTokenRefresher,
    server_state: Arc<ObsGatewayServerState>,
  ) -> Self {
    let twitch_thread = Arc::new(ObsTwitchThread::new(twitch_user_id, oauth_token_refresher, twitch_client));
    Self {
      twitch_user_id,
      twitch_thread,
      server_state,
    }
  }
}

impl Actor for ObsGatewayWebSocket {
  type Context = ws::WebsocketContext<Self>;

  fn started(&mut self, _ctx: &mut Self::Context) {
    let handle = Handle::current();
    let twitch_thread = self.twitch_thread.clone();


    //let future = self.twitch_thread.run_until_exit();
    ////let now_future = Delay::new(Duration::from_secs(5));
    //warn!("Starting thread...");
    ////actix_rt::spawn
    ////actix_rt::spawn(twitch_thread.run_until_exit());

    //actix_rt::spawn(future.map(|x| {
    //  println!("waited for 5 secs");
    //}));

    //handle.spawn_blocking(result);
//    handle.spawn_blocking(async {
//      warn!("inside thread 1");
//      let twitch_thread2 = twitch_thread.clone();
//      //async move {
//      //  warn!("inside thread 2");
//      //  twitch_thread2.run_until_exit().await;
//      //}.await;
//    });
    warn!("Thread started");
  }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ObsGatewayWebSocket {
  fn handle(
    &mut self,
    msg: Result<ws::Message, ws::ProtocolError>,
    ctx: &mut Self::Context,
  ) {
    if let Ok(msg) = msg {
      //info!(">>>>>> obs streamhandler::handle (msg = {:?})", msg);

      //let (tx, rx) = crossbeam::channel::bounded(1);
      //let handle = Handle::current();

      //let client = Arc::new(&self.twitch_client);
      //let client2 = client.clone();

      //handle.spawn(async {
      //  error!("Twitch PubSub Try read next...");
      //  match client2.try_next().await {
      //    Ok(r) => {
      //      error!("Twitch PubSub Result: {:?}", r);
      //    },
      //    Err(e) => {
      //      warn!("pubsub error: {:?}", e);
      //    }
      //  }
      //});

      //let res = rx.recv().unwrap();

      //info!("process message: {:?}", &msg);



      let mut redis = self.server_state.backends
          .redis_pool
          .get()
          .map_err(|err| {
            error!("Could not get Redis: {:?}", err);
            CommonServerError::ServerError
          }).unwrap(); // TODO: FIXME

      let channel = RedisKeys::obs_session_active_topic();

      let _count_received : Option<u64> = redis.publish(channel, self.twitch_user_id)
          .map_err(|e| {
            warn!("redis error: {:?}", e);
            CommonServerError::ServerError
          }).unwrap(); // TODO: Fixme


      match msg {
        ws::Message::Text(text) => {
          //info!("sending text response");
          ctx.text("hello from Rust")




        },
        ws::Message::Binary(bin) => ctx.binary(bin),
        ws::Message::Ping(bytes) => ctx.pong(&bytes),
        ws::Message::Close(reason) => {
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

// From the Actix homepage:

//use actix::{Actor, StreamHandler};
//use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
//use actix_web_actors::ws;
//
///// Define HTTP actor
//struct MyWs;
//
//impl Actor for MyWs {
//  type Context = ws::WebsocketContext<Self>;
//}
//
///// Handler for ws::Message message
//impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
//  fn handle(
//    &mut self,
//    msg: Result<ws::Message, ws::ProtocolError>,
//    ctx: &mut Self::Context,
//  ) {
//    match msg {
//      Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
//      Ok(ws::Message::Text(text)) => ctx.text(text),
//      Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
//      _ => (),
//    }
//  }
//}
//
//pub async fn twitch_pubsub_gateway(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
//  let resp = ws::start(MyWs {}, &req, stream);
//  println!("{:?}", resp);
//  resp
//}
