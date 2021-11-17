use actix::prelude::*;
use actix_web::{middleware, web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use crate::server_state::ObsGatewayServerState;
use log::error;
use log::warn;
use std::sync::Arc;

/// Endpoint
pub async fn obs_gateway_websocket_handler(
  request: HttpRequest,
  server_state: web::Data<Arc<ObsGatewayServerState>>,
  stream: web::Payload,
) -> Result<HttpResponse, Error> {
  error!(">>>>>> obs_ws_index");
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
