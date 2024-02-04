//! elasticsearch_updates
//!
//! The purpose of this library is to transform MySQL records into Elasticsearch records and keep Elasticsearch up
//! to date with the state of the database. These routines may need to be called in several places, so we keep them
//! in their own library
//!

// Never allow these
#![forbid(private_bounds)]
#![forbid(private_interfaces)]
#![forbid(unused_must_use)] // NB: It's unsafe to not close/check some things

// Okay to toggle
//#![forbid(unreachable_patterns)]
//#![forbid(unused_imports)]
//#![forbid(unused_mut)]
//#![forbid(unused_variables)]

// Always allow
#![allow(dead_code)]
#![allow(non_snake_case)]
