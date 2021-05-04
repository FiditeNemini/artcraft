extern crate anyhow; // TODO: No!
extern crate prost_build;

fn main() -> anyhow::Result<()> {
  prost_build::compile_protos(
    &[
      // TODO: This needs to respect glob
      "protos/storyteller-protos/protos/pubsub-events/pubsub-events.proto",
      "protos/storyteller-protos/protos/unreal/unreal.proto",
  ],
    &["protos/"])?;
  Ok(())
}
