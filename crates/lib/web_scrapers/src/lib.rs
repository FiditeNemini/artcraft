//! web_scrapers
//!
//! The purpose of this library is to scrape content from websites.
//! This should power our AI Chatbot and other functionalities.
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
#[macro_use] extern crate strum;

pub mod common_extractors;
pub mod payloads;
pub mod sites;