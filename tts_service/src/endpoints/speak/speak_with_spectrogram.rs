use actix_web::http::{StatusCode, header, HeaderName, HeaderValue};
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  Either,
  HttpRequest,
  HttpResponse,
  Result as ActixResult,
};

use arpabet::Arpabet;
use crate::AppState;
use crate::database::model::NewSentence;
use crate::endpoints::helpers::ip_address::get_request_ip;
use crate::endpoints::speak::api::{SpeakRequest, SpeakError};
use crate::inference::inference::InferencePipelineStart;
use crate::inference::pipelines::glowtts_melgan::GlowTtsMelganPipeline;
use crate::inference::pipelines::glowtts_multispeaker_melgan::{GlowTtsMultiSpeakerMelganPipeline, GlowTtsMultiSpeakerMelganPipelineMelDone};
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::inference::tts_model::TtsModelT;
use crate::inference::vocoder_model::VocoderModelT;
use crate::model::model_config::ModelPipeline;
use crate::model::old_model::TacoMelModel;
use crate::model::pipelines::{arpabet_glow_tts_melgan_pipeline, arpabet_glow_tts_multi_speaker_melgan_pipeline, arpabet_glow_tts_melgan_pipeline_with_spectrogram, arpabet_glow_tts_multi_speaker_melgan_pipeline_with_spectrogram};
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::text::cleaners::clean_text;
use std::sync::Arc;
use actix_web::client::Client;

#[derive(Serialize, Default)]
pub struct Spectrogram {
  pub bytes_base64: String,
  pub width: i64,
  pub height: i64,
}

#[derive(Serialize)]
pub struct SpeakSpectrogramResponse {
  pub audio_base64: String,
  pub spectrogram: Base64MelSpectrogram,
}

#[derive(Serialize,Debug)]
struct RecordRequest {
  remote_ip_address: String,
  text: String,
  speaker: String,
}

pub async fn post_speak_with_spectrogram(request: HttpRequest,
  query: Json<SpeakRequest>,
  app_state: Data<Arc<AppState>>)
  -> ActixResult<Json<SpeakSpectrogramResponse>, SpeakError>
{
  let app_state = app_state.into_inner();

  let client = Client::new();

  let ip_address = get_request_ip(&request);

  if let Err(err) = app_state.rate_limiter.maybe_ratelimit_request(&ip_address, &request.headers()) {
    return Err(SpeakError::rate_limited());
  }

  let speaker_slug = query.speaker.to_string();

  let r = RecordRequest {
    remote_ip_address: "1.1.1.1".to_string(),
    speaker: query.speaker.to_string(),
    text: query.text.to_string(),
  };

  let result = client.post("http://localhost:11111/sentence")
      .no_decompress()
      .header(header::CONTENT_TYPE, "application/json")
      .send_json(&r)
      .await;

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker_slug) {
    Some(speaker) => speaker,
    None => {
      return Err(SpeakError::unknown_speaker());
    },
  };

  let sample_rate_hz = speaker.sample_rate_hz.unwrap_or(app_state.default_sample_rate_hz);

  let text = query.text.to_string();

  if text.is_empty() {
    return Err(SpeakError::generic_bad_request("Request has empty text."));
  }

  app_state.sentence_recorder.record_sentence(&speaker_slug, &text, &ip_address);

  //let pipeline : Box<dyn InferencePipelineStart<TtsModel=TtsModelT, VocoderModel=VocoderModelT>> = match speaker.model_pipeline {
  let pipeline : Box<dyn InferencePipelineStart<TtsModel = Arc<dyn TtsModelT>, VocoderModel = Arc<dyn VocoderModelT>>> = match speaker.model_pipeline {
    ModelPipeline::ArpabetGlowTtsMelgan => {
      let glow_tts_model = speaker.glow_tts
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      let melgan_model = speaker.melgan
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      info!("Glow-TTS Model: {}", glow_tts_model);
      info!("Melgan Model: {}", melgan_model);
      info!("Text: {}", text);

      let glow_tts = app_state.model_cache.get_or_load_arbabet_glow_tts(&glow_tts_model)
          .expect(&format!("Couldn't load glow-tts model: {}", glow_tts_model));

      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      let inner = GlowTtsMelganPipeline::new(glow_tts.clone(), melgan.clone());
      Box::new(inner)
    },
    ModelPipeline::ArpabetGlowTtsMultiSpeakerMelgan=> {
      let glow_tts_multi_speaker_model = speaker.glow_tts_multi_speaker
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      let melgan_model = speaker.melgan
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      info!("Glow-TTS Multi-Speaker Model: {}", glow_tts_multi_speaker_model);
      info!("Melgan Model: {}", melgan_model);
      info!("Text: {}", text);

      let melgan = app_state
          .model_cache
          .get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      let glow_tts_multi_speaker = app_state
          .model_cache
          .get_or_load_arbabet_glow_tts_multi_speaker(&glow_tts_multi_speaker_model)
          .expect(&format!("Couldn't load glow-tts multi-speaker model: {}", glow_tts_multi_speaker_model));

      let inner = GlowTtsMultiSpeakerMelganPipeline::new(glow_tts_multi_speaker.clone(), melgan.clone());
      Box::new(inner)
    },
    ModelPipeline::RawTextTacotronMelgan => unimplemented!(),
    ModelPipeline::ArpabetTacotronMelgan => unimplemented!(),
  };

  let speaker_id = speaker.speaker_id.unwrap_or(-1);

  // TODO: Error handling for rich API errors
  let pipeline_done = pipeline.clean_text(&text)
    .unwrap()
    .infer_mel(speaker_id, &app_state.arpabet)
    .unwrap()
    .infer_audio(sample_rate_hz)
    .unwrap();

  let base64_image = pipeline_done.get_base64_mel_spectrogram().unwrap();
  let base64_audio = pipeline_done.get_base64_audio().unwrap();

  Ok(Json(SpeakSpectrogramResponse {
    audio_base64: base64_audio.bytes_base64,
    spectrogram: base64_image,
  }))
}
