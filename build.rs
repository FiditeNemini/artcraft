extern crate anyhow; // TODO: No!
extern crate prost_build;

use std::env;

fn main() -> anyhow::Result<()> {
  // NB: Control prost output dir with env var
  // Typically these land in `target/`, but I want to source control these.
  env::set_var("OUT_DIR", "src/proto_codegen");

  prost_build::compile_protos(
    &[
      "protos/storyteller-protos/protos/pubsub-events/pubsub-events.proto",
      "protos/storyteller-protos/protos/unreal/unreal.proto",
  ],
    &["protos/"])?;
  Ok(())
}
