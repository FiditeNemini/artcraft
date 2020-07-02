use hound::SampleFormat;
use hound::WavSpec;
use hound::WavWriter;
use std::io::BufWriter;
use std::io::Cursor;
use tch::Tensor;
use crate::model::arpabet_tacotron_model::ArpabetTacotronModel;
use crate::model::melgan_model::MelganModel;

pub struct TacoMelModel {
}

impl TacoMelModel {
  pub fn new() -> Self {
    Self {}
  }

  /*pub fn run_tts_audio(&self, text: &str) -> Vec<u8> {
    let audio_signal = self.run_tts(text);
    Self::audio_signal_to_wav_bytes(audio_signal)
  }

  fn run_tts(&self, text: &str) -> Vec<i16> {
    println!("Text : {:?}", text);
    let copied = text.to_string().to_ascii_lowercase();
    let mut text_buffer : Vec<i64> = Vec::new();

    for ch in copied.chars() {
      // TODO: HORRIBLE EXPERIMENTAL HACK.
      // Write a formal module to clean and process text
      let mut v = ch as i64 - 59;
      if v < 1 {
        v = 11; // NB: Space
      }
      text_buffer.push(v);
    }

    println!("Text buffer: {:?}", text_buffer);

    self.encoded_text_to_audio_signal(&text_buffer)
  }*/

  /// Run TTS on Arpabet encoding
  pub fn run_tts_encoded(&self,
    tacotron: &ArpabetTacotronModel,
    melgan: &MelganModel,
    encoded_text: &Vec<i64>,
    sample_rate_hz: u32
  ) -> Option<Vec<u8>> {
    let audio_signal = match self.encoded_text_to_audio_signal(tacotron, melgan, encoded_text) {
      None => return None,
      Some(audio_signal) => audio_signal,
    };
    let result = Self::audio_signal_to_wav_bytes(audio_signal, sample_rate_hz);
    Some(result)
  }

  fn encoded_text_to_audio_signal(&self, tacotron: &ArpabetTacotronModel, melgan: &MelganModel, text_buffer: &Vec<i64>) -> Option<Vec<i16>> {
    let mel_tensor = match tacotron.encoded_arpabet_to_mel(&text_buffer) {
      None => return None,
      Some(mel) => mel,
    };

    // TODO: The following experiment demonstrates that Tacotron is the source of the segfaults
    //  Tacotron must feature self-mutating features.
    /*let length = 1 * 80 * 1000 * 4; // NB: Each float is four bytes
    let data = [0].repeat(length);

    let mut size = Vec::new();
    size.push(1);
    size.push(80);
    size.push(1000);

    let mut mel_tensor = Tensor::of_data_size(&data, &size, Kind::Float);

    println!("Mel Tensor from tacotron: {:?}", mel_tensor);
    println!("Mel Tensor from tacotron.dim: {:?}", mel_tensor.dim());
    println!("Mel Tensor from tacotron.size: {:?}", mel_tensor.size());*/

    /*
    Text: test
    Sentence Tokens: [Word("test")]
    Encoded Text: [201, 24, 135, 22, 24, 254]
    Text tensor: [201, 24, 135, 22, 24, 254]
    Text tensor unsq: Tensor[[1, 6], Int64]
    Warning! Reached max decoder steps
    Mel Tensor from tacotron: Tensor[[1, 80, 1000], Float]
    Mel Tensor from tacotron.dim: 3
    Mel Tensor from tacotron.size: [1, 80, 1000]
     */

    let audio_tensor = melgan.tacotron_mel_to_audio(&mel_tensor);
    let result = Self::audio_tensor_to_audio_signal(audio_tensor);
    Some(result)
  }

  fn audio_tensor_to_audio_signal(mel: Tensor) -> Vec<i16> {
    let flat_audio_tensor = mel.squeeze();

    let length = flat_audio_tensor.size1().unwrap() as usize;
    let mut data = [0.0f32].repeat(length);

    flat_audio_tensor.copy_data(data.as_mut_slice(), length as usize);

    data.iter().map(|x| x.trunc() as i16).collect()
  }

  pub fn audio_signal_to_wav_bytes(audio_signal: Vec<i16>, sample_rate_hz: u32) -> Vec<u8> {
    let spec = WavSpec {
      channels: 1,
      sample_rate: sample_rate_hz,
      bits_per_sample: 16,
      sample_format: SampleFormat::Int,
    };
    let bytes: Vec<u8> = Vec::new();
    let seek: Cursor<Vec<u8>> = Cursor::new(bytes);
    let mut buffer = BufWriter::new(seek);
    {
      let mut writer = WavWriter::new(&mut buffer, spec).unwrap();
      for s in audio_signal {
        //let s = s * 0.00001f32; // TODO: Find a more appropriate multiplier
        writer.write_sample(s).unwrap();
      }
      writer.finalize().unwrap(); // TODO: Error
    }
    match buffer.into_inner() {
      Err(_) => { Vec::new() }, // TODO: Error
      Ok(r) => { r.get_ref().to_vec() },
    }
  }
}
