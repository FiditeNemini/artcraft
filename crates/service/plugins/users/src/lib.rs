#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;

pub const RESERVED_USERNAMES : &str = include_str!("../../../../../includes/binary_includes/reserved_usernames.txt");
pub const RESERVED_SUBSTRINGS : &str = include_str!("../../../../../includes/binary_includes/reserved_usernames_including.txt");

pub mod common_responses;
pub mod cookies;
pub mod endpoints;
pub mod session;
pub mod utils;
pub mod validations;