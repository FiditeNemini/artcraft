//! filesys
//!
//! The purpose of this library is to make basic filesystem operations easier.
//! We won't be including content type or magic type features that incur a higher cost.
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

pub mod create_dir_all_if_missing;
pub mod directory_exists;
pub mod file_exists;
pub mod file_size;
pub mod filename_concat;
pub mod path_to_string;
pub mod rename_across_devices;
