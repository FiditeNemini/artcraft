// Include the protos
pub mod protos {
  include!(concat!(env!("OUT_DIR"), "/storyteller.pubsub.rs"));
  include!(concat!(env!("OUT_DIR"), "/storyteller.unreal.rs"));
}