// Include the protos
pub mod protos {
  //include!(concat!(env!("OUT_DIR"), "/storyteller.pubsub.rs"));
  include!("proto_codegen/storyteller.pubsub.rs");
}