use base64::{Config, CharacterSet};
use base64;
use container_common::anyhow_result::AnyhowResult;
use magic_crypt::generic_array::typenum::U256;
use magic_crypt::new_magic_crypt;
use magic_crypt::{MagicCryptTrait, MagicCrypt256};
use rand::RngCore;
use std::io::Cursor;

// TODO: A protobuf would be more compact!
/// This gets encrypted and sent to the frontend as an opaque handle.
#[derive(Serialize, Deserialize)]
pub struct SortId {
  // NB: Entropy is causing React to panic on re-renders
  //pub entropy: u32,
  pub column_id: u64,
}

/// This exists so that we don't leak our database IDs.
/// If competitors see our IDs, they'll know how big our database is.
/// We encrypt our IDs so we don't leak "business secret information".
#[derive(Clone)]
pub struct SortKeyCrypto {
  crypt: MagicCrypt256,
  base64_config: Config,
}

impl SortKeyCrypto {
  pub fn new(secret: &str) -> Self {
    let base64_config = Config::new(CharacterSet::UrlSafe, false)
        .decode_allow_trailing_bits(true);
    Self {
      crypt: new_magic_crypt!(secret, 256),
      base64_config,
    }
  }

  pub fn encrypt_id(&self, id: u64) -> AnyhowResult<String> {
    let mut rng = rand::thread_rng();

    let payload = SortId {
      //entropy: rng.next_u32(),
      column_id: id,
    };

    let payload = serde_json::to_string(&payload)?;

    let mut reader = Cursor::new(payload);
    let mut writer = Vec::new();

    self.crypt.encrypt_reader_to_writer2::<U256>(&mut reader, &mut writer)?;
    let encoded = base64::encode_config(&writer, self.base64_config.clone());

    Ok(encoded)
  }

  pub fn decrypt_id(&self, base_64_payload: &str) -> AnyhowResult<u64> {
    //let payload = self.crypt.decrypt_base64_to_string(base_64_payload)?;

    let decoded_bytes= base64::decode_config(base_64_payload, self.base64_config)?;
    let decrypted_bytes = self.crypt.decrypt_bytes_to_bytes(&decoded_bytes)?;

    let payload = String::from_utf8(decrypted_bytes)?;
    let payload = serde_json::from_str::<SortId>(&payload)?;

    Ok(payload.column_id)
  }
}

#[cfg(test)]
mod tests {
  use crate::util::encrypted_sort_id::SortKeyCrypto;
  use std::collections::HashSet;

//  #[test]
//  fn encrypt_entropy_means_no_duplicate_values() {
//    let sorter = SortKeyCrypto::new("secret");
//
//    let mut encrypted_tokens = HashSet::new();
//
//    for i in 0 .. 1000 {
//      let encrypted = sorter.encrypt_id(1234).unwrap();
//      encrypted_tokens.insert(encrypted);
//    }
//
//    assert_eq!(encrypted_tokens.len(), 1000);
//  }

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
