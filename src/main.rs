#[macro_use] extern crate log;


/*#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
}*/

use hyper::server::conn::AddrStream;
use hyper::{Body, Request, Response, Server};
use hyper::service::{service_fn, make_service_fn};
use futures::future::{self, Future};

type BoxFut = Box<Future<Item=Response<Body>, Error=hyper::Error> + Send>;

fn debug_request(req: Request<Body>) -> BoxFut {
  let body_str = format!("{:?}", req);
  let response = Response::new(Body::from(body_str));
  Box::new(future::ok(response))
}

fn main() {

  // This is our socket address...
  let addr = ([127, 0, 0, 1], 13900).into();

  // A `Service` is needed for every connection.
  let make_svc = make_service_fn(|socket: &AddrStream| {
    let remote_addr = socket.remote_addr();
    service_fn(move |req: Request<Body>| { // returns BoxFut

      if req.uri().path().starts_with("/target/first") {

        // will forward requests to port 13901
        return hyper_reverse_proxy::call(remote_addr.ip(), "http://127.0.0.1:12345", req)

      } else if req.uri().path().starts_with("/target/second") {

        // will forward requests to port 13902
        return hyper_reverse_proxy::call(remote_addr.ip(), "http://127.0.0.1:3000", req)

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