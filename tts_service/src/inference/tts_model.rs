use tch::Tensor;

pub trait TtsModelT {
  fn encoded_sequence_to_mel(&self, arpabet_encodings: &Vec<i64>, speaker_id: i64) -> Tensor;

  fn encoded_sequence_to_mel_single_speaker(&self, arpabet_encodings: &Vec<i64>) -> Tensor;
}
