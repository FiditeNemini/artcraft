#[macro_use] extern crate enum_primitive;
extern crate libc;

pub mod wrapper;
pub mod wrapper_test;

use libc::size_t;
use wrapper::*;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::borrow::BorrowMut;

pub fn main() {
  wrapper_test::test_integration();
}

