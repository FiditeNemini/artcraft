use uuid::Uuid;

pub fn generate_random_uuid() -> String {
  let uuid = Uuid::new_v4();
  let mut buffer = Uuid::encode_buffer();
  let hyphenated_uuid = uuid.to_hyphenated()
    .encode_lower(&mut buffer);
  hyphenated_uuid.to_string()
}
