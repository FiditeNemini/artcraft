use actix::prelude::*;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use crate::server_state::ObsGatewayServerState;
use log::error;
use log::warn;
use std::sync::Arc;
use crate::twitch::websocket_client::PollingTwitchWebsocketClient;
use twitch_api2::pubsub;
use twitch_api2::pubsub::Topic;

/// Endpoint
pub async fn obs_gateway_websocket_handler(
  request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>,
  stream: web::Payload,
) -> Result<HttpResponse, Error> {
  error!(">>>>>> obs_ws_index");

  let mut client = PollingTwitchWebsocketClient::new().unwrap();

  error!("Connecting to Twitch PubSub...");
  client.connect().await.unwrap();

  error!("Connected to Twitch PubSub");

  //println!("Starting polling thread...");
  //client.start_ping_thread().await;

  error!("Sending Twitch PubSub PING...");

  client.send_ping().await.unwrap();

  error!("Try read next from Twitch PubSub...");
  let r = client.try_next().await.unwrap();
  error!("Twitch PubSub Result: {:?}", r);

  // User: vocodes
  //let user_id = 652567283;

  let user_id = server_state.twitch_oauth_temp.temp_oauth_user_id.parse::<u32>().unwrap();

  let bit_topic = pubsub::channel_bits::ChannelBitsEventsV2 {
    channel_id: user_id,
  }.into_topic();

  let sub_topic = pubsub::channel_subscriptions::ChannelSubscribeEventsV1 {
    channel_id: user_id,
  }.into_topic();

  let topics = [bit_topic, sub_topic];

  let auth_token = server_state.twitch_oauth_temp.temp_oauth_access_token.clone();

  error!("Begin TwitchPubSub LISTEN on authenticated OAuth topics...");

  client.listen(&auth_token, &topics).await.unwrap();

  error!("Twitch PubSub Try read next...");
  let r = client.try_next().await.unwrap();

  error!("Twitch PubSub Result: {:?}", r);

  error!("Begin Javascript WebSocket...");
  let websocket = ObsGatewayWebSocket::new();
  ws::start(websocket, &request, stream)
}

/// Websocket behavior
struct ObsGatewayWebSocket {}

impl ObsGatewayWebSocket {
  fn new() -> Self {
    Self {}
  }
}

impl Actor for ObsGatewayWebSocket {
  type Context = ws::WebsocketContext<Self>;

  fn started(&mut self, _ctx: &mut Self::Context) {
    error!(">>>>>> obs actor started");
  }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ObsGatewayWebSocket {
  fn handle(
    &mut self,
    msg: Result<ws::Message, ws::ProtocolError>,
    ctx: &mut Self::Context,
  ) {
    if let Ok(msg) = msg {
      error!(">>>>>> obs streamhandler::handle (msg = {:?})", msg);
      match msg {
        ws::Message::Text(text) => ctx.text(text),
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
