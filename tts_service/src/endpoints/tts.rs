use actix_web::http::StatusCode;
use actix_web::web::{
  Data,
  Json,
};
use actix_web::{
  HttpRequest,
  HttpResponse,
  get,
};

use std::sync::Arc;
use crate::AppState;
use arpabet::Arpabet;
use crate::text::text_to_arpabet_encoding;
use crate::old_model::TacoMelModel;

/// For JSON payloads
#[derive(Deserialize)]
pub struct TtsRequest {
  text: String,
  speaker: String,
  // The client can specify the models to use
  arpabet_tacotron_model: Option<String>,
  melgan_model: Option<String>,
}

pub async fn post_tts(request: HttpRequest,
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
  println!("Tacotron Model: {}", tacotron_model);
  println!("Melgan Model: {}", melgan_model);
  println!("Text: {}", text);

  let arpabet = Arpabet::load_cmudict();
  let encoded = text_to_arpabet_encoding(arpabet, &text);

  println!("Encoded Text: {:?}", encoded);

  let mut app_state = app_state.into_inner();

  let tacotron = app_state.model_cache.get_or_load_arbabet_tacotron(&tacotron_model).unwrap();
  let melgan = app_state.model_cache.get_or_load_melgan(&melgan_model).unwrap();

  let wav_data = TacoMelModel::new().run_tts_encoded(&tacotron, &melgan, &encoded);

  Ok(HttpResponse::build(StatusCode::OK)
      .content_type("audio/wav")
      .body(wav_data))
}
