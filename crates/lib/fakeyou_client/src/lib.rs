//! fakeyou_client
//!
//! Dogfooding our own thing internally.
//!

// Never allow these
#![forbid(private_in_public)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

//// Okay to toggle
//#![forbid(unreachable_patterns)]
//#![forbid(unused_imports)]
//#![forbid(unused_mut)]
//#![forbid(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]

#[macro_use] extern crate serde_derive;

pub mod api;
pub mod fakeyou_api_client;
pub mod get_audio_url;

