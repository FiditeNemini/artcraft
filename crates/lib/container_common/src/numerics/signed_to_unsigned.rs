
// TODO: Use macros to define these (or use a better numeric crate)

/// Negative numbers coalesce to 0
pub fn i8_to_unsigned_zeroing_negatives(num: i8) -> u8 {
  if num.is_negative() {
    0
  } else {
    num.unsigned_abs()
  }
}

/// Negative numbers coalesce to 0
pub fn i16_to_unsigned_zeroing_negatives(num: i16) -> u16 {
  if num.is_negative() {
    0
  } else {
    num.unsigned_abs()
  }
}

/// Negative numbers coalesce to 0
pub fn i32_to_unsigned_zeroing_negatives(num: i32) -> u32 {
  if num.is_negative() {
    0
  } else {
    num.unsigned_abs()
  }
}

/// Negative numbers coalesce to 0
pub fn i64_to_unsigned_zeroing_negatives(num: i64) -> u64 {
  if num.is_negative() {
    0
  } else {
    num.unsigned_abs()
  }
}

/// Negative numbers coalesce to 0
pub fn i128_to_unsigned_zeroing_negatives(num: i128) -> u128 {
  if num.is_negative() {
    0
  } else {
    num.unsigned_abs()
  }
}

/// Negative numbers coalesce to 0
pub fn isize_to_unsigned_zeroing_negatives(num: isize) -> usize {
  if num.is_negative() {
    0
  } else {
    num.unsigned_abs()
  }
}

#[cfg(test)]
mod tests {
  use crate::numerics::signed_to_unsigned::i8_to_unsigned_zeroing_negatives;
  use crate::numerics::signed_to_unsigned::i16_to_unsigned_zeroing_negatives;
  use crate::numerics::signed_to_unsigned::i32_to_unsigned_zeroing_negatives;
  use crate::numerics::signed_to_unsigned::i64_to_unsigned_zeroing_negatives;
  use crate::numerics::signed_to_unsigned::i128_to_unsigned_zeroing_negatives;
  use crate::numerics::signed_to_unsigned::isize_to_unsigned_zeroing_negatives;

  #[test]
  fn i8_to_unsigned() {
    assert_eq!(i8_to_unsigned_zeroing_negatives(-127), 0);
    assert_eq!(i8_to_unsigned_zeroing_negatives(-1), 0);
    assert_eq!(i8_to_unsigned_zeroing_negatives(0), 0);
    assert_eq!(i8_to_unsigned_zeroing_negatives(1), 1);
    assert_eq!(i8_to_unsigned_zeroing_negatives(100), 100);
    assert_eq!(i8_to_unsigned_zeroing_negatives(127), 127);
  }

  #[test]
  fn i16_to_unsigned() {
    assert_eq!(i16_to_unsigned_zeroing_negatives(-127), 0);
    assert_eq!(i16_to_unsigned_zeroing_negatives(-1), 0);
    assert_eq!(i16_to_unsigned_zeroing_negatives(0), 0);
    assert_eq!(i16_to_unsigned_zeroing_negatives(1), 1);
    assert_eq!(i16_to_unsigned_zeroing_negatives(100), 100);
    assert_eq!(i16_to_unsigned_zeroing_negatives(127), 127);
  }

  #[test]
  fn i32_to_unsigned() {
    assert_eq!(i32_to_unsigned_zeroing_negatives(-127), 0);
    assert_eq!(i32_to_unsigned_zeroing_negatives(-1), 0);
    assert_eq!(i32_to_unsigned_zeroing_negatives(0), 0);
    assert_eq!(i32_to_unsigned_zeroing_negatives(1), 1);
    assert_eq!(i32_to_unsigned_zeroing_negatives(100), 100);
    assert_eq!(i32_to_unsigned_zeroing_negatives(127), 127);
  }

  #[test]
  fn i64_to_unsigned() {
    assert_eq!(i64_to_unsigned_zeroing_negatives(-127), 0);
    assert_eq!(i64_to_unsigned_zeroing_negatives(-1), 0);
    assert_eq!(i64_to_unsigned_zeroing_negatives(0), 0);
    assert_eq!(i64_to_unsigned_zeroing_negatives(1), 1);
    assert_eq!(i64_to_unsigned_zeroing_negatives(100), 100);
    assert_eq!(i64_to_unsigned_zeroing_negatives(127), 127);
  }


  #[test]
  fn i128_to_unsigned() {
    assert_eq!(i128_to_unsigned_zeroing_negatives(-127), 0);
    assert_eq!(i128_to_unsigned_zeroing_negatives(-1), 0);
    assert_eq!(i128_to_unsigned_zeroing_negatives(0), 0);
    assert_eq!(i128_to_unsigned_zeroing_negatives(1), 1);
    assert_eq!(i128_to_unsigned_zeroing_negatives(100), 100);
    assert_eq!(i128_to_unsigned_zeroing_negatives(127), 127);
  }

  #[test]
  fn isize_to_unsigned() {
    assert_eq!(isize_to_unsigned_zeroing_negatives(-127), 0);
    assert_eq!(isize_to_unsigned_zeroing_negatives(-1), 0);
    assert_eq!(isize_to_unsigned_zeroing_negatives(0), 0);
    assert_eq!(isize_to_unsigned_zeroing_negatives(1), 1);
    assert_eq!(isize_to_unsigned_zeroing_negatives(100), 100);
    assert_eq!(isize_to_unsigned_zeroing_negatives(127), 127);
  }
}