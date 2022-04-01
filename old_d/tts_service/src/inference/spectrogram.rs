
#[derive(Default)]
pub struct MelSpectrogram {
  pub bytes: Vec<u8>,
  pub width: i64,
  pub height: i64,
}

#[derive(Serialize, Default)]
pub struct Base64MelSpectrogram {
  pub bytes_base64: String,
  pub width: i64,
  pub height: i64,
}
