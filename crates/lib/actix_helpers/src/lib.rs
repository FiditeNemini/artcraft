//! actix_helpers
//!
//! The purpose of this library is to collect utility functionality that may be useful
//! to reuse across Actix installs.
//!

// Never allow these
#![forbid(private_in_public)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

// Okay to toggle
#![forbid(unreachable_patterns)]
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]

pub mod extractors;
pub mod middleware;
pub mod route_builder;
