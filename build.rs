extern crate anyhow; // TODO: No!
extern crate prost_build;

fn main() -> anyhow::Result<()> {
  prost_build::compile_protos(
    &[
      "protos/storyteller-protos/protos/pubsub-events/pubsub-events.proto"
    ],
    &["protos/"])?;
  Ok(())
}
