#![deny(unused_must_use)]
#![allow(dead_code)]
#![allow(unused_imports)]
#![allow(unused_mut)]
#![allow(unused_variables)]
//#![allow(warnings)]

pub mod util;

use crate::util::anyhow_result::AnyhowResult;

fn main() -> AnyhowResult<()> {
  Ok(())
}
