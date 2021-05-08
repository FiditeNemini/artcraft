use anyhow::anyhow;
use crate::AnyhowResult;
use log::{info, warn, debug};

// Include the protos
pub mod protos {
  //include!(concat!(env!("OUT_DIR"), "/storyteller.pubsub.rs"));
  include!("proto_codegen/storyteller.pubsub.rs");
}

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
