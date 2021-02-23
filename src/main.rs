
pub type AnyhowResult<T> = anyhow::Result<T>;

pub fn main() -> AnyhowResult<()> {
  println!("Twitch Gateway");
  Ok(())
}