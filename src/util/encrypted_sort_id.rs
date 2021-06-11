
use base64;
use magic_crypt::{MagicCryptTrait, MagicCrypt256};
use magic_crypt::generic_array::typenum::U256;
use std::io::Cursor;
use magic_crypt::new_magic_crypt;
use crate::util::anyhow_result::AnyhowResult;
use rand::RngCore;

// TODO: A protobuf would be more compact!
/// This gets encrypted and sent to the frontend as an opaque handle.
#[derive(Serialize, Deserialize)]
pub struct SortId {
  pub entropy: u32,
  pub column_id: u64,
}

pub struct SortKeyCrypto {
  crypt: MagicCrypt256,
}

impl SortKeyCrypto {
  pub fn new(secret: &str) -> Self {
    Self {
      crypt: new_magic_crypt!(secret, 256),
    }
  }

  pub fn encrypt_id(&self, id: u64) -> AnyhowResult<String> {
    let mut rng = rand::thread_rng();

    let payload = SortId {
      entropy: rng.next_u32(),
      column_id: id,
    };

    let payload = serde_json::to_string(&payload)?;

    let mut reader = Cursor::new(payload);
    let mut writer = Vec::new();

    self.crypt.encrypt_reader_to_writer2::<U256>(&mut reader, &mut writer)?;
    let encoded = base64::encode(&writer);

    Ok(encoded)
  }

  pub fn decrypt_id(&self, base_64_payload: &str) -> AnyhowResult<u64> {
    let payload = self.crypt.decrypt_base64_to_string(base_64_payload)?;
    let payload = serde_json::from_str::<SortId>(&payload)?;
    Ok(payload.column_id)
  }
}

#[cfg(test)]
mod tests {
  use crate::util::encrypted_sort_id::SortKeyCrypto;
  use std::collections::HashSet;

  #[test]
  fn encrypt_entropy_means_no_duplicate_values() {
    let sorter = SortKeyCrypto::new("secret");

    let mut encrypted_tokens = HashSet::new();

    for i in 0 .. 1000 {
      let encrypted = sorter.encrypt_id(1234).unwrap();
      encrypted_tokens.insert(encrypted);
    }

    assert_eq!(encrypted_tokens.len(), 1000);
  }

  #[test]
  fn encrypt_roundtrip() {
    let sorter = SortKeyCrypto::new("secret");
    let encrypted = sorter.encrypt_id(1234).unwrap();
    let decrypted = sorter.decrypt_id(&encrypted).unwrap();
    assert_eq!(decrypted, 1234);
  }

  #[test]
  fn encrypt_lots_roundtrip_low_numbers() {
    let sorter = SortKeyCrypto::new("secret");

    for i in 0 .. 1000 {
      let encrypted = sorter.encrypt_id(i).unwrap();
      let decrypted = sorter.decrypt_id(&encrypted).unwrap();
      assert_eq!(decrypted, i);
    }
  }

  #[test]
  fn encrypt_lots_roundtrip_high_numbers() {
    let sorter = SortKeyCrypto::new("secret");

    for i in 100000000 .. 100005000 {
      let encrypted = sorter.encrypt_id(i).unwrap();
      let decrypted = sorter.decrypt_id(&encrypted).unwrap();
      assert_eq!(decrypted, i);
    }
  }
}
