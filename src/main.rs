#[macro_use] extern crate anyhow;
#[macro_use] extern crate log;
#[macro_use] extern crate serde_derive;

use anyhow::{Result as AnyhowResult, Error};
use futures::future::{self, Future};
use hyper::Method;
use hyper::rt::Stream;
use hyper::server::conn::AddrStream;
use hyper::service::{service_fn, make_service_fn};
use hyper::{Body, Request, Response, Server};
use std::env;
use std::fmt::Debug;
use std::fmt::Display;
use std::str::FromStr;

type BoxFut = Box<dyn Future<Item=Response<Body>, Error=hyper::Error> + Send>;

const ENV_PROXY_CONFIG_FILE : &'static str = "PROXY_CONFIG_FILE";
const ENV_ROUTE_ONE : &'static str = "ROUTE_ONE";
const ENV_ROUTE_TWO : &'static str = "ROUTE_TWO";
const ENV_RUST_LOG : &'static str = "RUST_LOG";
const ENV_SERVICE_PORT : &'static str = "SERVICE_PORT";

const DEFAULT_PROXY_CONFIG_FILE : &'static str = "proxy_configs.toml";
const DEFAULT_RUST_LOG: &'static str = "debug";
const DEFAULT_SERVICE_PORT: u16 = 5555;
const ROUTE_ONE_DEFAULT : &'static str = "http://127.0.0.1:12345";
const ROUTE_TWO_DEFAULT : &'static str = "http://127.0.0.1:3000";

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

#[derive(Deserialize, Debug)]
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
  let service_port = get_env_num::<u16>(ENV_SERVICE_PORT, DEFAULT_SERVICE_PORT)?;

  info!("Route one: {}", route_one);
  info!("Route two: {}", route_two);

  let proxy_configs_file = get_env_string(ENV_PROXY_CONFIG_FILE, DEFAULT_PROXY_CONFIG_FILE);
  info!("Proxy config file: {}", proxy_configs_file);

  let proxy_configs = ProxyConfigs::load_from_file(&proxy_configs_file)?;
  info!("Proxy configs: {:?}", proxy_configs);

  // This is our socket address...
  let addr = ([127, 0, 0, 1], service_port).into();

  // A `Service` is needed for every connection.
  let make_svc = make_service_fn(move |socket: &AddrStream| {
    let remote_addr = socket.remote_addr();
    info!("Got a request from: {:?}", remote_addr);


    let route_a = route_one.clone();
    let route_b = route_two.clone();

    service_fn(move |req: Request<Body>| { // returns BoxFut
      match req.method() {
        &Method::OPTIONS => {
          // TODO: CORS should be hardcoded here, not wastefully proxied.
          return hyper_reverse_proxy::call(remote_addr.ip(), &route_a, req); // Return BoxFut
        },
        _ => {},
      }

      let remote_addr2 = remote_addr.clone();

      if req.uri().path().eq("/speak") {

        info!("/speak");

        let (_parts, body) = req.into_parts();

        let body_bytes = body.concat2().wait().unwrap().into_bytes();
        let request: SpeakRequest = serde_json::from_slice(&body_bytes).unwrap();

        print!("Request: {:?}", request);

        let new_req = Request::new(Body::empty());
        return hyper_reverse_proxy::call(remote_addr.ip(), &route_a, new_req)

      } else if req.uri().path().eq("/speak_spectrogram") {
        info!("/speak_spectrogram");

        Box::new(req.into_body().concat2().map(move |b| { // Builds a BoxedFut to return
          // Parse the request body. form_urlencoded::parse
          // always succeeds, but in general parsing may
          // fail (for example, an invalid post of json), so
          // returning early with BadRequest may be
          // necessary.
          //
          // Warning: this is a simplified use case. In
          // principle names can appear multiple times in a
          // form, and the values should be rolled up into a
          // HashMap<String, Vec<String>>. However in this
          // example the simpler approach is sufficient.
          //let params = form_urlencoded::parse(b.as_ref()).into_owned().collect::<HashMap<String, String>>();

          // Validate the request parameters, returning
          // early if an invalid input is detected.
          /*let name = if let Some(n) = params.get("name") {
            n
          } else {
            return Response::builder()
              .status(StatusCode::UNPROCESSABLE_ENTITY)
              .body(MISSING.into())
              .unwrap();
          };
          let number = if let Some(n) = params.get("number") {
            if let Ok(v) = n.parse::<f64>() {
              v
            } else {
              return Response::builder()
                .status(StatusCode::UNPROCESSABLE_ENTITY)
                .body(NOTNUMERIC.into())
                .unwrap();
            }
          } else {
            return Response::builder()
              .status(StatusCode::UNPROCESSABLE_ENTITY)
              .body(MISSING.into())
              .unwrap();
          };*/

          //let request : SpeakRequest = serde_json::from_str(&req.body().into()).unwrap();
          //let request: SpeakRequest = serde_json::from_slice(&body_bytes).unwrap();
          let request : SpeakRequest = serde_json::from_slice(b.as_ref()).unwrap();
          info!("Request: {:?}", request);

          let name = "asdf";
          let number = "asdf";


          // Render the response. This will often involve
          // calls to a database or web service, which will
          // require creating a new stream for the response
          // body. Since those may fail, other error
          // responses such as InternalServiceError may be
          // needed here, too.
          let body = format!("Hello {}, your number is {}", name, number);
          Response::new(body.into())

        }).and_then(move |f: Response<Body>| {
          let remote_addr3 = remote_addr2.clone();
          let new_req = Request::new(Body::empty());
          hyper_reverse_proxy::call(remote_addr3.ip(), "http://127.0.0.1:12345/speak_request", new_req)
        }))

        //Box::new(boxed.then( |b : Result<Response<Body>, Error> | {
        //  let new_req = Request::new(Body::empty());
        //  hyper_reverse_proxy::call(remote_addr2.ip(), "http://127.0.0.1:12345/speak_request", new_req)
        //}))

        //let new_req = Request::new(Body::empty());
        //return hyper_reverse_proxy::call(remote_addr.ip(), &route_b, new_req)

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
