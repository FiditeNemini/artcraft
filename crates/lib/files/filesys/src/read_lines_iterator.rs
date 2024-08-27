use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;

/// Read lines from a file in an iterator.
/// From Rust manual: https://doc.rust-lang.org/rust-by-example/std_misc/file/read_lines.html
pub fn read_lines_iterator<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where P: AsRef<Path>, {
  let file = File::open(filename)?;
  Ok(io::BufReader::new(file).lines())
}
