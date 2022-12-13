//! tokens
//! The purpose of this library is to have a strongly-typed primary/foreign key system.
//! Every Database or Redis key will have a type here.
//! Well known keys will have short identifiers (eg. "user" is prefixed with "U:")

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

#[macro_use]
mod macros;

pub mod jobs;
pub mod users;
