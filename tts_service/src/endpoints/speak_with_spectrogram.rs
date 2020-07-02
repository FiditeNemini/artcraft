use actix_web::http::{StatusCode, header, HeaderName, HeaderValue};
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  Either,
  HttpRequest,
  HttpResponse,
};

use arpabet::Arpabet;
use crate::AppState;
use crate::database::model::NewSentence;
use crate::inference::inference::InferencePipelineStart;
use crate::inference::pipelines::glowtts_melgan::GlowTtsMelganPipeline;
use crate::inference::pipelines::glowtts_multispeaker_melgan::{GlowTtsMultiSpeakerMelganPipeline, GlowTtsMultiSpeakerMelganPipelineMelDone};
use crate::inference::spectrogram::Base64MelSpectrogram;
use crate::model::model_config::ModelPipeline;
use crate::model::old_model::TacoMelModel;
use crate::model::pipelines::{arpabet_glow_tts_melgan_pipeline, arpabet_glow_tts_multi_speaker_melgan_pipeline, arpabet_glow_tts_melgan_pipeline_with_spectrogram, arpabet_glow_tts_multi_speaker_melgan_pipeline_with_spectrogram};
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::text::cleaners::clean_text;
use std::sync::Arc;
use crate::inference::vocoder_model::VocoderModelT;
use crate::inference::tts_model::TtsModelT;

#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
}

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

pub async fn post_speak_with_spectrogram(request: HttpRequest,
  query: Json<SpeakRequest>,
  app_state: Data<Arc<AppState>>)
  -> Either<Json<SpeakSpectrogramResponse>, std::io::Result<HttpResponse>>
{
  let app_state = app_state.into_inner();

  let speaker_slug = query.speaker.to_string();

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker_slug) {
    Some(speaker) => speaker,
    None => {
      return Either::B(Ok(HttpResponse::build(StatusCode::NOT_FOUND)
          .content_type("text/plain")
          .body("Speaker not found")));
    },
  };

  let sample_rate_hz = speaker.sample_rate_hz.unwrap_or(app_state.default_sample_rate_hz);

  let text = query.text.to_string();

  if text.is_empty() {
    return Either::B(Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
        .content_type("text/plain")
        .body("Request has empty text.")));
  }

  let ip_address = match request.headers().get(HeaderName::from_static("x-voder-proxy-for")) {
    Some(ip_address) => {
      // Unfortunately the upstream Rust proxy is replacing the `forwarded` and `x-forwarded-for`
      // headers, so we populate this custom header as a workaround.
      info!("Proxied IP address: {:?}", ip_address);
      ip_address.to_str()
          .unwrap_or("")
          .to_string()
    },
    None => {
      // If we're running without the upstream Rust proxy, we can grab 'x-forarded-for', which is
      // populated by the Digital Ocean load balancer.
      let ip_address_and_port = request.connection_info()
          .remote()
          .unwrap_or("")
          .to_string();
      let ip_address = ip_address_and_port.split(":")
          .collect::<Vec<&str>>()
          .get(0)
          .copied()
          .unwrap_or("")
          .to_string();
      info!("Forwarded IP address: {}", &ip_address);
      ip_address
    },
  };

  let sentence_record = NewSentence {
    sentence: text.clone(),
    speaker: speaker_slug.clone(),
    ip_address: ip_address,
  };

  match sentence_record.insert(&app_state.database_connector) {
    Err(e) => error!("Could not insert sentence record for: {:?}, because: {:?}",
      sentence_record, e),
    Ok(_) => {},
  }

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
    .infer_mel(speaker_id)
    .unwrap()
    .infer_audio(sample_rate_hz)
    .unwrap();

  let base64_image = pipeline_done.get_base64_mel_spectrogram().unwrap();
  let base64_audio = pipeline_done.get_base64_audio().unwrap();

  Either::A(Json(SpeakSpectrogramResponse {
    audio_base64: base64_audio.bytes_base64,
    spectrogram: base64_image,
  }))
}
