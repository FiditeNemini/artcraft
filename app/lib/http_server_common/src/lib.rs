//!
//! Common HTTP Server components
//!

#[macro_use] extern crate serde_derive;

// This is a little messy since we're supporting two versions of the Actix crate ecosystem.
// Long story short: one service requires an old Tokio runtime, and another needs the newer one.
//
// I don't think this will be too hard to maintain. AFAICT, the only major differences are which
// package "HttpResponseBuilder" is located in.

#[cfg(all(feature = "actix-new", not(feature = "actix-old")))]
//#[cfg(feature = "actix-cors-new")]
extern crate actix_cors_new as actix_cors;
#[cfg(all(feature = "actix-new", not(feature = "actix-old")))]
//#[cfg(feature = "actix-http-new")]
extern crate actix_http_new as actix_http;
#[cfg(all(feature = "actix-new", not(feature = "actix-old")))]
//#[cfg(feature = "actix-web-new")]
extern crate actix_web_new as actix_web;

#[cfg(all(feature = "actix-old", not(feature = "actix-new")))]
//#[cfg(feature = "actix-cors-old")]
extern crate actix_cors_old as actix_cors;
#[cfg(all(feature = "actix-old", not(feature = "actix-new")))]
//#[cfg(feature = "actix-http-old")]
extern crate actix_http_old as actix_http;
#[cfg(all(feature = "actix-old", not(feature = "actix-new")))]
//#[cfg(feature = "actix-web-old")]
extern crate actix_web_old as actix_web;

//#[cfg(any(
//  all(feature = "actix-cors-new", not(feature = "actix-cors-old")),
//  all(feature = "actix-cors-old", not(feature = "actix-cors-new")),
//))]
#[cfg(any(
  feature = "actix-new",
  feature = "actix-old",
))]
pub mod cors;

#[cfg(any(
  feature = "actix-new",
  feature = "actix-old",
))]
pub mod endpoints;

#[cfg(any(
  feature = "actix-new",
  feature = "actix-old",
))]
pub mod response;
