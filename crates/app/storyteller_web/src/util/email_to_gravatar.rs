use md5::{Md5, Digest};

pub fn email_to_gravatar(email_address: &str) -> String {
  let email = email_address.trim().to_lowercase();

  let mut hasher = Md5::new();
  hasher.update(email);
  let hash = hasher.finalize();
  let gravatar_hash = format!("{:x}", hash);

  gravatar_hash
}
