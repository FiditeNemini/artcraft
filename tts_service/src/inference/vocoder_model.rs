use tch::Tensor;

pub trait VocoderModelT {
  fn mel_to_audio(&self, mel_tensor: &Tensor) -> Tensor;
}