#[macro_use] extern crate log;
#[macro_use] extern crate serde_derive;


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
use anyhow::Result as AnyhowResult;
use std::env;

type BoxFut = Box<Future<Item=Response<Body>, Error=hyper::Error> + Send>;

const ENV_PROXY_CONFIG_FILE : &'static str = "PROXY_CONFIG_FILE";
const ENV_ROUTE_ONE : &'static str = "ROUTE_ONE";
const ENV_ROUTE_TWO : &'static str = "ROUTE_TWO";
const ENV_RUST_LOG : &'static str = "RUST_LOG";

const ROUTE_ONE_DEFAULT : &'static str = "http://127.0.0.1:12345";
const ROUTE_TWO_DEFAULT : &'static str = "http://127.0.0.1:3000";
const DEFAULT_PROXY_CONFIG_FILE : &'static str = "proxy_configs.toml";
const DEFAULT_RUST_LOG: &'static str = "debug";

#[derive(Deserialize, Debug, Clone)]
struct ProxyConfigs {
  pub backends: Vec<ProxyConfig>,
}

#[derive(Deserialize, Debug, Clone)]
struct ProxyConfig {
  pub voice : String,
  pub ip: String,
  pub port: String,
}

impl ProxyConfigs {
  pub fn load_from_file(filename: &str) -> AnyhowResult<Self> {
    let contents = std::fs::read_to_string(filename)?;
    let configs = toml::from_str(&contents)?;
    Ok(configs)
  }
}

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

fn main() -> AnyhowResult<()> {
  if env::var(ENV_RUST_LOG)
    .as_ref()
    .ok()
    .is_none()
  {
    println!("Setting default logging level to \"{}\", override with env var {}.",
             DEFAULT_RUST_LOG, ENV_RUST_LOG);
    std::env::set_var(ENV_RUST_LOG, DEFAULT_RUST_LOG);
  }

  env_logger::init();

  let route_one = get_env_string(ENV_ROUTE_ONE, ROUTE_ONE_DEFAULT);
  let route_two = get_env_string(ENV_ROUTE_TWO, ROUTE_TWO_DEFAULT);

  info!("Route one: {}", route_one);
  info!("Route two: {}", route_two);

  let proxy_configs_file = get_env_string(ENV_PROXY_CONFIG_FILE, DEFAULT_PROXY_CONFIG_FILE);
  info!("Proxy config file: {}", proxy_configs_file);

  let proxy_configs = ProxyConfigs::load_from_file(&proxy_configs_file)?;
  info!("Proxy configs: {:?}", proxy_configs);

  // This is our socket address...
  let addr = ([127, 0, 0, 1], 13900).into();

  // A `Service` is needed for every connection.
  let make_svc = make_service_fn(move |socket: &AddrStream| {
    let remote_addr = socket.remote_addr();
    let route_a = route_one.clone();
    let route_b = route_two.clone();

    service_fn(move |req: Request<Body>| { // returns BoxFut

      if req.uri().path().starts_with("/first") {
        return hyper_reverse_proxy::call(remote_addr.ip(), &route_a, req)

      } else if req.uri().path().starts_with("/second") {
        return hyper_reverse_proxy::call(remote_addr.ip(), &route_b, req)

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

  Ok(())
}
