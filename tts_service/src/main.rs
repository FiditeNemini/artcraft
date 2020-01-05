#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;
#[macro_use] extern crate serde_derive;
extern crate hound;
extern crate serde;
extern crate serde_json;
extern crate tch;

use rocket::http::{RawStr, ContentType};
use rocket::response::content::Content;
use rocket::{Request, State, Response};
use rocket_contrib::json::{Json, JsonValue};
use tch::CModule;
use tch::Tensor;
use tch::nn::Module;
use tch::nn::ModuleT;

#[catch(404)]
fn not_found(_req: &Request) -> String {
  "404 Not Found".into()
}

#[get("/")]
pub fn get_root() -> String {
  "Hello World".into()
}

#[get("/readiness")]
pub fn get_readiness() -> String {
  "Ready".into()
}

#[get("/liveness")]
pub fn get_liveness() -> String {
  "Live".into()
}

pub fn main() {
  rocket::ignite()
      .mount("/", routes![
          get_root,
          get_readiness,
          get_liveness,
      ])
      //.manage(model)
      .register(catchers![not_found])
      .launch();
}
