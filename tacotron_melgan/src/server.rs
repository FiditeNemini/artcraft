use rocket::{Request, State, Response};
use rocket::response::content::Content;
use rocket::http::{RawStr, ContentType};
use rocket_contrib::json::{Json, JsonValue};
use model::TacoMelModel;

#[derive(Serialize, Deserialize)]
struct Message {
  contents: String,
}

#[get("/")]
fn get_index() -> String {
  format!("<b>Hello</b>")
}

//#[put("/tts", data = "<request>")]
#[get("/tts?<text>")]
//fn post_tts(request: String) -> JsonValue {
//fn get_tts(model: State<TacoMelModel>, text: &RawStr) -> Vec<u8> {
fn get_tts(model: State<TacoMelModel>, text: &RawStr) -> Content<Vec<u8>> {
  let audio_bytes = model.inner().run_tts_audio(text.as_str());
  //json!({ "status": "ok" })
  /*Response::build()
      .header(ContentType::new("audio", "wav"))
      .wr
      .ok()*/
  Content(ContentType::new("audio", "wav"), audio_bytes)
}

#[catch(404)]
fn not_found(req: &Request) -> String {
  format!("I couldn't find '{}'. Try something else?", req.uri())
}

pub fn run_server() {
  /*let options = Options::Index | Options::DotFiles;
  rocket::ignite()
      .mount("/static", StaticFiles::from("/www/public"))
      .mount("/pub", StaticFiles::new("/www/public", options).rank(-1))*/

  let model = TacoMelModel::create(
    "/home/bt/dev/voder/tacotron_melgan/tacotron_jit_model_voder_c0cac635.pt",
    "/home/bt/dev/voder/tacotron_melgan/melgan_jit_model_voder_c0cac635.pt");

  rocket::ignite()
      .mount("/", routes![
          get_index,
          get_tts,
      ])
      .manage(model)
      .register(catchers![not_found])
      .launch();
}



