#[macro_use] extern crate anyhow;
#[macro_use] extern crate log;
#[macro_use] extern crate serde_derive;

use anyhow::Result as AnyhowResult;
use futures::future::{self, Future};
use hyper::Method;
use hyper::rt::Stream;
use hyper::server::conn::AddrStream;
use hyper::service::{service_fn, make_service_fn};
use hyper::{Body, Request, Response, Server};
use std::collections::HashMap;
use std::env;
use std::fmt::Debug;
use std::fmt::Display;
use std::net::SocketAddr;
use std::str::FromStr;
use std::sync::Arc;
use rand::seq::IteratorRandom;
use hyper::http::header::HeaderName;
use hyper::header::HeaderValue;

type BoxFut = Box<dyn Future<Item=Response<Body>, Error=hyper::Error> + Send>;

const ENV_DEFAULT_ROUTE : &'static str = "DEFAULT_ROUTE";
const ENV_PROXY_CONFIG_FILE : &'static str = "PROXY_CONFIG_FILE";
const ENV_RUST_LOG : &'static str = "RUST_LOG";
const ENV_SERVICE_PORT : &'static str = "SERVICE_PORT";

const DEFAULT_DEFAULT_ROUTE : &'static str = "http://127.0.0.1:12345";
const DEFAULT_PROXY_CONFIG_FILE : &'static str = "proxy_configs.toml";
const DEFAULT_RUST_LOG: &'static str = "tokio_reactor=warn,hyper=info,debug";
const DEFAULT_SERVICE_PORT: u16 = 5555;

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

/// NB: This much match the shape of SpeakRequest in the 'voder/tts_service' code.
/// This is used for both /speak and /speak_spectrogram requests.
#[derive(Serialize, Deserialize, Debug)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
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

// the trait `std::error::Error` is not implemented for `<T as std::str::FromStr>::Err`
fn get_env_num<T>(env_name: &str, default: T) -> AnyhowResult<T>
  where T: FromStr + Display,
        T::Err: Debug
{
  match env::var(env_name).as_ref().ok() {
    None => {
      warn!("Env var '{}' not supplied. Using default '{}'.", env_name, default);
      Ok(default)
    },
    Some(val) => {
      match val.parse::<T>() {
        Err(e) => bail!("Can't parse value '{:?}'. Error: {:?}", val, e),
        Ok(val) => Ok(val),
      }
    },
  }
}

fn _debug_request(req: Request<Body>) -> BoxFut {
  let body_str = format!("{:?}", req);
  let response = Response::new(Body::from(body_str));
  Box::new(future::ok(response))
}

struct RequestDetails {
  pub request_bytes: Vec<u8>,
  pub speaker: String,
}

struct Router {
  pub routes: HashMap<String, String>,
  pub default_route: String,
}

impl Router {
  fn get_random_host(&self) -> String {
    let mut rng = rand::thread_rng();
    self.routes.values()
      .choose(&mut rng)
      .map(|url| url.to_string())
      .unwrap_or(self.default_route.clone())
  }

  fn get_speaker_host(&self, voice: &str) -> String {
    self.routes.get(voice)
      .map(|url| url.to_string())
      .unwrap_or(self.default_route.clone())
  }
}

fn speak_proxy(req: Request<Body>, remote_addr: SocketAddr, router: Arc<Router>, endpoint: &'static str) -> BoxFut {
  let mut headers = req.headers().clone();

  let forwarded_ip = HeaderValue::from_str(&remote_addr.ip().to_string())
    .ok()
    .unwrap_or(HeaderValue::from_static("127.0.0.1"));
  headers.insert(HeaderName::from_static("forwarded"), forwarded_ip.clone());
  headers.insert(HeaderName::from_static("x-forwarded-for"), forwarded_ip.clone());

  Box::new(req.into_body().concat2().map(move |b| { // Builds a BoxedFut to return
    let request_bytes = b.as_ref();

    let request = serde_json::from_slice::<SpeakRequest>(request_bytes)
      .unwrap();

    RequestDetails {
      request_bytes: request_bytes.to_vec(),
      speaker: request.speaker,
    }
  }).and_then(move |request_details: RequestDetails| {
    /*let proxy_host = match router.get_speaker_host(&request_details.speaker) {
      Some(host) => host,
      None => {
        let response = Response::builder()
          .body(Body::from("error"))
          .unwrap();
        let result : BoxFut = Box::new(future::ok(response));
        return result;
      },
    };*/

    let proxy_host = router.get_speaker_host(&request_details.speaker);

    info!("Routing {} for {} to {}", endpoint, &request_details.speaker, &proxy_host);

    let mut request_builder = Request::builder();
    request_builder.method(Method::POST)
      .uri(endpoint);

    for (k, v) in headers.iter() {
      request_builder.header(k, v);
    }

    let new_req = request_builder
      .body(Body::from(request_details.request_bytes))
      .unwrap();

    hyper_reverse_proxy::call(remote_addr.ip(), &proxy_host, new_req)
  }))
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

  let default_route = get_env_string(ENV_DEFAULT_ROUTE, DEFAULT_DEFAULT_ROUTE);
  let service_port = get_env_num::<u16>(ENV_SERVICE_PORT, DEFAULT_SERVICE_PORT)?;

  info!("Default route: {}", default_route);

  let proxy_configs_file = get_env_string(ENV_PROXY_CONFIG_FILE, DEFAULT_PROXY_CONFIG_FILE);
  info!("Proxy config file: {}", proxy_configs_file);

  let proxy_configs = ProxyConfigs::load_from_file(&proxy_configs_file)?;
  info!("Proxy configs: {:?}", proxy_configs);

  let mut route_map = HashMap::new();

  for backend in proxy_configs.backends.iter() {
    let host = format!("http://{}:{}", backend.ip, backend.port);
    route_map.insert(backend.voice.clone(), host);
  }

  let router = Arc::new(Router {
    routes: route_map,
    default_route: default_route,
  });

  //let routes = route_map.clone();

  // A `Service` is needed for every connection.
  let make_service = make_service_fn(move |socket: &AddrStream| {
    let remote_addr = socket.remote_addr();
    info!("Got a request from: {:?}", remote_addr);

    let router2 = router.clone();

    service_fn(move |req: Request<Body>| {
      let router3 = router2.clone();

      match (req.method(), req.uri().path()) {
        (&Method::POST, "/speak") =>
          speak_proxy(req, remote_addr.clone(), router3, "/speak"),
        (&Method::POST, "/speak_spectrogram") =>
          speak_proxy(req, remote_addr.clone(), router3, "/speak_spectrogram"),
        _ => {
          let forward = router3.get_random_host();
          hyper_reverse_proxy::call(remote_addr.ip(), &forward, req)
        }
      }
    })
  });

  let addr = ([127, 0, 0, 1], service_port).into();

  info!("Running server on {:?}", addr);

  let server = Server::bind(&addr)
    .serve(make_service)
    .map_err(|e| eprintln!("server error: {}", e));

  // Run this server for... forever!
  hyper::rt::run(server);

  Ok(())
}
