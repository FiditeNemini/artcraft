//! files
//!
//! The purpose of this library is to have a strongly-typed MySQL enum-type wrapper.
//! This should also work for CHAR/VARCHAR fields that work similarly to enums (typically
//! as part of a composite key)
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

pub mod hash;
pub mod mimetype;
