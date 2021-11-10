//!
//! Common HTTP Server components
//!

#[macro_use] extern crate serde_derive;

// This is a little messy since we're supporting two versions of the Actix crate ecosystem.
// Long story short: one service requires an old Tokio runtime, and another needs the newer one.
//
// I don't think this will be too hard to maintain. AFAICT, the only major differences are which
// package "HttpResponseBuilder" is located in.

#[cfg(feature = "actix-new")]
extern crate actix_http_new as actix_http;

#[cfg(feature = "actix-new")]
extern crate actix_web_new as actix_web;

#[cfg(feature = "actix-old")]
extern crate actix_http_old as actix_http;

#[cfg(feature = "actix-old")]
extern crate actix_web_old as actix_web;

pub mod cors;
pub mod endpoints;
pub mod response;
