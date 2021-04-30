// Include the protos
pub mod protos {
  include!(concat!(env!("OUT_DIR"), "/storyteller.twitchgateway.rs"));
  include!(concat!(env!("OUT_DIR"), "/storyteller.unreal.rs"));
}