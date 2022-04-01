use actix_web::http::StatusCode;
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  HttpRequest,
  HttpResponse,
};

use arpabet;
use crate::AppState;
use crate::model::old_model::TacoMelModel;
use crate::text::arpabet::text_to_arpabet_encoding;
use crate::text::cleaners::clean_text;
use std::sync::Arc;

/// For JSON payloads
#[derive(Deserialize)]
pub struct TtsRequest {
  text: String,
  speaker: String,
  // The client can specify the models to use
  arpabet_tacotron_model: Option<String>,
  melgan_model: Option<String>,
}

pub async fn post_tts(_request: HttpRequest,
  query: Json<TtsRequest>,
  app_state: Data<Arc<AppState>>
) -> std::io::Result<HttpResponse> {
  println!("POST /tts");

  let tacotron_model = query.arpabet_tacotron_model
      .as_ref()
      .map(|s| s.clone())
      .unwrap_or("/home/bt/dev/voder/tacotron_melgan/tacotron2_trump_txlearn_ljs_arpabet_2020-05-14_ckpt11500.jit".to_string());

  let melgan_model = query.melgan_model
      .as_ref()
      .map(|s| s.clone())
      .unwrap_or("/home/bt/dev/tacotron-melgan/melgan_trump-txlearn-2020.05.05_13675.jit".to_string());

  let text = query.text.to_string();
  debug!("Tacotron Model: {}", tacotron_model);
  debug!("Melgan Model: {}", melgan_model);
  debug!("Text: {}", text);

  let cleaned_text = clean_text(&text);

  let cmudict = arpabet::load_cmudict();
  let encoded = text_to_arpabet_encoding(cmudict, &cleaned_text);

  let sample_rate_hz = app_state.default_sample_rate_hz;

  debug!("Encoded Text: {:?}", encoded);

  let app_state = app_state.into_inner();

  let tacotron = app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model)
      .expect(&format!("Couldn't load tacotron: {}", &tacotron_model));

  let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model)
      .expect(&format!("Couldn't load melgan: {}", &melgan_model));

  match TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded, sample_rate_hz) {
    None => {
      Ok(HttpResponse::build(StatusCode::TOO_MANY_REQUESTS)
          .content_type("text/plain")
          .body("The service is receiving too many requests. Although there are many worker \
                 containers, model access is serialized on a per-container basis until the \
                 segfaults are fixed."))
    },
    Some(wav_data) => {
      Ok(HttpResponse::build(StatusCode::OK)
          .content_type("audio/wav")
          .body(wav_data))
    },
  }
}
