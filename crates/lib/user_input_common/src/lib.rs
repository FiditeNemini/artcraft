#![forbid(dead_code)]
#![forbid(non_snake_case)]
#![forbid(private_in_public)]
#![forbid(unused_imports)]
#![forbid(unused_must_use)] // Important
#![forbid(unused_mut)]
#![forbid(unused_variables)]
#![forbid(warnings)]

pub (crate) const BANNED_SLURS : &'static str = include_str!("../../../../db/banned_slurs.txt");

pub mod check_for_slurs;
pub mod latin_alphabet;
