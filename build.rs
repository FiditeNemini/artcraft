extern crate anyhow; // TODO: No!
extern crate prost_build;

fn main() -> anyhow::Result<()> {
  prost_build::compile_protos(
    &[
      // TODO: This needs to respect glob
      "protos/storyteller-protos/protos/twitch-gateway/twitch-gateway.proto"
    ],
    &["protos/"])?;
  Ok(())
}
