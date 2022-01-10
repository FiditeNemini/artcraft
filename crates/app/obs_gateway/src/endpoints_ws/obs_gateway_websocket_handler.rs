use actix::prelude::*;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use crate::server_state::ObsGatewayServerState;
use log::error;
use log::warn;
use log::info;
use std::sync::Arc;
use crate::twitch::websocket_client::PollingTwitchWebsocketClient;
use twitch_api2::pubsub;
use twitch_api2::pubsub::Topic;
use tokio::runtime::Handle;
use crate::endpoints_ws::obs_twitch_thread::ObsTwitchThread;
use std::thread::sleep;
use std::time::Duration;
use actix_rt::Runtime;

/// Endpoint
pub async fn obs_gateway_websocket_handler(
  request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>,
  stream: web::Payload,
) -> Result<HttpResponse, Error> {
  info!(">>>>>> obs_ws_index");

  let mut client = PollingTwitchWebsocketClient::new().unwrap();

  info!("Connecting to Twitch PubSub...");
  client.connect().await.unwrap();

  info!("Connected to Twitch PubSub");

  //println!("Starting polling thread...");
  //client.start_ping_thread().await;

  info!("Sending Twitch PubSub PING...");

  client.send_ping().await.unwrap();

  info!("Try read next from Twitch PubSub...");
  let r = client.try_next().await.unwrap();
  info!("Twitch PubSub Result: {:?}", r);

  // User: vocodes
  //let user_id = 652567283;

  let user_id = server_state.twitch_oauth_temp.temp_oauth_user_id.parse::<u32>().unwrap();

  let bit_topic = pubsub::channel_bits::ChannelBitsEventsV2 {
    channel_id: user_id,
  }.into_topic();

  let points_topic = pubsub::channel_points::ChannelPointsChannelV1 {
    channel_id: user_id,
  }.into_topic();

  let cheer_topic = pubsub::channel_cheer::ChannelCheerEventsPublicV1 {
    channel_id: user_id,
  }.into_topic();

  let sub_topic = pubsub::channel_subscriptions::ChannelSubscribeEventsV1 {
    channel_id: user_id,
  }.into_topic();

  let topics = [bit_topic, points_topic, cheer_topic, sub_topic];

  let auth_token = server_state.twitch_oauth_temp.temp_oauth_access_token.clone();

  info!("Begin TwitchPubSub LISTEN on authenticated OAuth topics...");

  client.listen(&auth_token, &topics).await.unwrap();


  //let (tx, rx) = crossbeam::channel::bounded(1);
  //let client = Arc::new(&self.twitch_client);
  //let client2 = client.clone();

  //let res = rx.recv().unwrap();

  info!("Begin Javascript WebSocket...");
  let websocket = ObsGatewayWebSocket::new(client);

  ws::start(websocket, &request, stream)
}

/// Websocket behavior
struct ObsGatewayWebSocket {
  //twitch_client: PollingTwitchWebsocketClient,
  twitch_thread: ObsTwitchThread,
}


impl ObsGatewayWebSocket {
  fn new(twitch_client: PollingTwitchWebsocketClient) -> Self {
    let twitch_thread = ObsTwitchThread::new(twitch_client);
    Self {
      twitch_thread
    }
  }
}

impl Actor for ObsGatewayWebSocket {
  type Context = ws::WebsocketContext<Self>;

  fn started(&mut self, _ctx: &mut Self::Context) {
    info!(">>>>>> obs actor started");


    info!("before spawn thread");

    let handle = Handle::current();
    //let rt = Runtime::new().unwrap();

    handle.spawn_blocking(|| {
      //error!("Twitch PubSub Try read next...");
      //match client2.try_next().await {
      //  Ok(r) => {
      //    error!("Twitch PubSub Result: {:?}", r);
      //  },
      //  Err(e) => {
      //    warn!("pubsub error: {:?}", e);
      //  }
      //}
      loop {
        info!("thread loop");
        sleep(Duration::from_millis(1000));
      }
    });

    info!("after thread spawn");

  }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ObsGatewayWebSocket {
  fn handle(
    &mut self,
    msg: Result<ws::Message, ws::ProtocolError>,
    ctx: &mut Self::Context,
  ) {
    if let Ok(msg) = msg {
      info!(">>>>>> obs streamhandler::handle (msg = {:?})", msg);

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

      info!("process message: {:?}", &msg);


      match msg {
        ws::Message::Text(text) => {
          info!("sending text response");
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
