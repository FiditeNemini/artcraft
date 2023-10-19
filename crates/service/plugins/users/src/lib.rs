#[macro_use] extern crate lazy_static;
#[macro_use] extern crate serde_derive;

pub const RESERVED_USERNAMES : &str = include_str!("../../../../../includes/binary_includes/reserved_usernames.txt");
pub const RESERVED_SUBSTRINGS : &str = include_str!("../../../../../includes/binary_includes/reserved_usernames_including.txt");

pub mod cookies;
pub mod default_routes;
pub mod endpoints;
pub mod utils;
pub mod validations;