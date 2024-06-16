use uuid::Uuid;

pub fn generate_random_uuid() -> String {
  let uuid = Uuid::new_v4();
  let mut buffer = Uuid::encode_buffer();
  let hyphenated_uuid = uuid.hyphenated()
    .encode_lower(&mut buffer);
  hyphenated_uuid.to_string()
}

#[cfg(test)]
mod tests {
  #[test]
  fn test_generate_random_uuid() {
    let uuid = super::generate_random_uuid();
    assert_eq!(uuid.len(), 36);
  }
}
