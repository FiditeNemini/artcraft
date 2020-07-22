use actix_web::http::{StatusCode, header, HeaderName, HeaderValue};
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  HttpRequest,
  HttpResponse,
};

use arpabet::Arpabet;
use crate::AppState;
use crate::database::model::NewSentence;
use crate::model::model_config::ModelPipeline;
use crate::model::old_model::TacoMelModel;
use crate::model::pipelines::{arpabet_glow_tts_melgan_pipeline, arpabet_glow_tts_multi_speaker_melgan_pipeline};
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::text::cleaners::clean_text;
use futures::{future, Future, Lazy, SelectNext, MapErr};
use limitation::{Error as LimitationError, Error};
use limitation::Status;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use futures::future::FutureResult;

#[derive(Deserialize)]
pub struct SpeakRequest {
  /// Slug for the speaker
  speaker: String,
  /// Raw text to be spoken
  text: String,
}

enum ErrorOrTimeout {
  Error(LimitationError),
  PermitAcquireTimeout,
}

pub async fn post_speak(request: HttpRequest,
  query: Json<SpeakRequest>,
  app_state: Data<Arc<AppState>>)
  -> std::io::Result<HttpResponse>
{
  let app_state = app_state.into_inner();

  let speaker_slug = query.speaker.to_string();

  let speaker = match app_state.model_configs.find_speaker_by_slug(&speaker_slug) {
    Some(speaker) => speaker,
    None => {
      return Ok(HttpResponse::build(StatusCode::NOT_FOUND)
          .content_type("text/plain")
          .body("Speaker not found"));
    },
  };

  let sample_rate_hz = speaker.sample_rate_hz.unwrap_or(app_state.default_sample_rate_hz);

  let text = query.text.to_string();

  if text.is_empty() {
    return Ok(HttpResponse::build(StatusCode::BAD_REQUEST)
        .content_type("text/plain")
        .body("Request has empty text."));
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

  let permit = app_state.rate_limiter.count(&ip_address)
      .map_err(|e| ErrorOrTimeout::Error(e));
      /*.and_then(|f| match f {
        Ok(ok) => future::ok(ok),
        Err(err) => future::err(err),
      });*/

  let permit_timeout = future::lazy(|| {
    thread::sleep(Duration::from_millis(5000));
    future::err::<Status, ErrorOrTimeout>(ErrorOrTimeout::PermitAcquireTimeout)
  });

  let result = permit.select(permit_timeout).wait();
  match result {
    Err(_) => warn!("WAT"),
    Ok((Ok(permit_status), _timeout_future)) => {

    },
    Ok((Err(permit_status), _timeout_future)) => {

    },

    /*Ok((data, _timeout_future)) => {
      warn!("Testing")
    }*/

    /*Ok((Ok(data), _timeout_future)) => info!("Redis did fine"),

    Ok((Err(_timeout), _timeout_future)) => warn!("Error doing redis things"),

    // A normal I/O error happened, so we pass that on through.
    Err((e, _other_future)) => warn!("wat"),

    _ => warn!("WAT WAT")*/
  }

  match request.headers().get(HeaderName::from_static("x-forwarded-for")) {
    Some(header_value) => {
      info!("Remote x-forwarded-for: {:?}", header_value);
    },
    None => {},
  }

  match request.headers().get(HeaderName::from_static("forwarded")) {
    Some(header_value) => {
      info!("Remote forwarded: {:?}", header_value);
    },
    None => {},
  }

  let sentence_record = NewSentence {
    sentence: text.clone(),
    speaker: speaker_slug.clone(),
    ip_address: ip_address.clone(),
  };

  match sentence_record.insert(&app_state.database_connector) {
    Err(e) => error!("Could not insert sentence record for: {:?}, because: {:?}",
      sentence_record, e),
    Ok(_) => {},
  }

  let cleaned_text = clean_text(&text);

  match speaker.model_pipeline {
    ModelPipeline::ArpabetTacotronMelgan => {
      let tacotron_model = speaker.tacotron
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      let melgan_model = speaker.melgan
          .as_ref()
          .map(|s| s.clone())
          .expect("TODO ERROR HANDLING");

      info!("Tacotron Model: {}", tacotron_model);
      info!("Melgan Model: {}", melgan_model);
      info!("Text: {}", text);

      let arpabet = Arpabet::load_cmudict();
      let encoded = text_to_arpabet_encoding(arpabet, &cleaned_text);

      let tacotron = app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model)
          .expect(&format!("Couldn't load tacotron model: {}", tacotron_model));

      let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      match TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded, sample_rate_hz) {
        None => {
          Ok(HttpResponse::build(StatusCode::TOO_MANY_REQUESTS)
              .content_type("text/plain")
              .body("The service is receiving too many requests. Although there are many worker \
                     containers, model access is serialized on a per-container basis until the \
                     segfaults are fixed."))
        },
        Some(wav_data) => {
          // To make iOS Safari work, you need a Content-Range and Content-Length header:
          // https://stackoverflow.com/a/17835399
          let content_range_value = format!("bytes 0-{}/{}", wav_data.len(), wav_data.len());
          Ok(HttpResponse::build(StatusCode::OK)
              .content_type("audio/wav")
              .set_header(header::CONTENT_DISPOSITION, "attachment; filename = \"generated.wav\"")
              .set_header(header::CONTENT_RANGE, content_range_value)
              .body(wav_data))
        },
      }
    },
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

      let wav_data = arpabet_glow_tts_melgan_pipeline(
        &cleaned_text,
        &glow_tts,
        &melgan,
        sample_rate_hz,
        &app_state.arpabet);

      // To make iOS Safari work, you need a Content-Range and Content-Length header:
      // https://stackoverflow.com/a/17835399
      let content_range_value = format!("bytes 0-{}/{}", wav_data.len(), wav_data.len());
      Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .set_header(header::CONTENT_DISPOSITION, "attachment; filename = \"generated.wav\"")
          .set_header(header::CONTENT_RANGE, content_range_value)
          .body(wav_data))
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

      let speaker_id = speaker.speaker_id.expect("Should have speaker_id");

      let glow_tts_multi_speaker = app_state
          .model_cache
          .get_or_load_arbabet_glow_tts_multi_speaker(&glow_tts_multi_speaker_model)
          .expect(&format!("Couldn't load glow-tts multi-speaker model: {}", glow_tts_multi_speaker_model));

      let melgan = app_state
          .model_cache
          .get_or_load_melgan(&melgan_model)
          .expect(&format!("Couldn't load melgan model: {}", melgan_model));

      let wav_data = arpabet_glow_tts_multi_speaker_melgan_pipeline(
        &cleaned_text,
        speaker_id,
        &glow_tts_multi_speaker,
        &melgan,
        sample_rate_hz,
        &app_state.arpabet);

      // To make iOS Safari work, you need a Content-Range and Content-Length header:
      // https://stackoverflow.com/a/17835399
      let content_range_value = format!("bytes 0-{}/{}", wav_data.len(), wav_data.len());
      Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .set_header(header::CONTENT_DISPOSITION, "attachment; filename = \"generated.wav\"")
          .set_header(header::CONTENT_RANGE, content_range_value)
          .body(wav_data))
    },
    ModelPipeline::RawTextTacotronMelgan => unimplemented!(),
  }
}
