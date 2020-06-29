#[macro_use] extern crate log;


/*#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
}*/

use futures::future::{self, Future};
use hyper::server::conn::AddrStream;
use hyper::service::{service_fn, make_service_fn};
use hyper::{Body, Request, Response, Server};
use std::env;

type BoxFut = Box<Future<Item=Response<Body>, Error=hyper::Error> + Send>;

const ENV_ROUTE_ONE : &'static str = "ROUTE_ONE";
const ENV_ROUTE_TWO : &'static str = "ROUTE_TWO";

const ROUTE_ONE_DEFAULT : &'static str = "http://127.0.0.1:12345";
const ROUTE_TWO_DEFAULT : &'static str = "http://127.0.0.1:3000";

fn get_env_string(env_name: &str, default: &str) -> String {
  match env::var(env_name).as_ref().ok() {
    Some(s) => s.to_string(),
    None => {
      warn!("Env var '{}' not supplied. Using default '{}'.", env_name, default);
      default.to_string()
    },
  }
}

fn debug_request(req: Request<Body>) -> BoxFut {
  let body_str = format!("{:?}", req);
  let response = Response::new(Body::from(body_str));
  Box::new(future::ok(response))
}

fn main() {
  let route_one = get_env_string(ENV_ROUTE_ONE, ROUTE_ONE_DEFAULT);
  let route_two = get_env_string(ENV_ROUTE_TWO, ROUTE_TWO_DEFAULT);

  info!("Route one: {}", route_one);
  info!("Route two: {}", route_two);

  // This is our socket address...
  let addr = ([127, 0, 0, 1], 13900).into();

  // A `Service` is needed for every connection.
  let make_svc = make_service_fn(|socket: &AddrStream| {
    let remote_addr = socket.remote_addr();
    service_fn(move |req: Request<Body>| { // returns BoxFut

      if req.uri().path().starts_with("/first") {
        return hyper_reverse_proxy::call(remote_addr.ip(), &route_one, req)

      } else if req.uri().path().starts_with("/second") {
        return hyper_reverse_proxy::call(remote_addr.ip(), &route_two, req)

      } else {
        debug_request(req)
      }
    })
  });

  let server = Server::bind(&addr)
    .serve(make_svc)
    .map_err(|e| eprintln!("server error: {}", e));

  println!("Running server on {:?}", addr);

  // Run this server for... forever!
  hyper::rt::run(server);
}