use anyhow::anyhow;
use crate::AnyhowResult;

// Binary encode a proto.
pub fn binary_encode_proto(proto: impl prost::Message) -> AnyhowResult<Vec<u8>> {
  let mut buffer : Vec<u8> = Vec::with_capacity(proto.encoded_len());
  let encode_result = proto.encode(&mut buffer);

  match encode_result {
    Err(e) => {
      Err(anyhow!("Inner proto encode result: {:?}", e))
    }
    Ok(_) => {
      Ok(buffer)
    }
  }
}
