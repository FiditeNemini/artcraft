use rocket::{Request, State, Response};
use rocket::response::content::Content;
use rocket::http::{RawStr, ContentType};
use rocket_contrib::json::{Json, JsonValue};
use model::{TacoMelModel, load_wrapped_tensor_file, load_model_file, audio_signal_to_wav_bytes};
use tch::nn::Module;
use melgan::audio_tensor_to_audio_signal;
use tch::Tensor;
use std::panic;

#[derive(Serialize, Deserialize)]
struct Message {
  contents: String,
}

#[get("/")]
fn get_index() -> String {
  format!("<b>Hello</b>")
}

#[get("/tts?<text>")]
fn get_tts(model: State<TacoMelModel>, text: &RawStr) -> Content<Vec<u8>> {

  let result = panic::catch_unwind(|| {
    let audio_bytes = model.inner().run_tts_audio(text.as_str());
    audio_bytes
  });

  match result {
    Err(_) => {
      Content(ContentType::Plain, "there was an error".as_bytes().to_vec())
    },
    Ok(audio_bytes) => {
      Content(ContentType::new("audio", "wav"), audio_bytes)
    }
  }
}

fn print_mel(tensor: &Tensor, i: i64) {
  let t = tensor.squeeze();
  print!("M[{}][0:5] =", i);
  for j in 0..5 {
    print!(" {:?}", t.get(i).get(j));
  }
  println!();
}

fn print_audio(tensor: &Tensor, i: i64) {
  let t = tensor.squeeze();
  println!("A[{}] = {:?}", i, t.get(i));
}

fn print_audio_signal(signal: &Vec<i16>, i: usize) {
  println!("W[{}] = {:?}", i, signal.get(i).unwrap());
}


#[get("/tts_test")]
fn get_tts_test() -> Content<Vec<u8>> {
  println!("Loading melgan model...");
  let melgan_filename  = "/home/bt/dev/tacotron-melgan/shared_melgan_container.pt";
  let melgan_filename  = "/home/bt/dev/tacotron-melgan/shared_melgan_container2.pt";
  let melgan_model = load_model_file(melgan_filename);

  println!("Loading mel...");
  let mel_tensor = load_wrapped_tensor_file("/home/bt/dev/tacotron-melgan/saved_mel.pt.containerized.pt");

  println!("⚙️");
  print_mel(&mel_tensor, 0);
  print_mel(&mel_tensor, 1);
  print_mel(&mel_tensor, 2);
  print_mel(&mel_tensor, 3);
  print_mel(&mel_tensor, 4);
  print_mel(&mel_tensor, 79);

  //println!("\n\n>>> Mel tensor:\n{:?}\n\n", mel_tensor);

  let audio_tensor = melgan_model.forward(&mel_tensor);

  print_audio(&audio_tensor, 0);
  print_audio(&audio_tensor, 1);
  print_audio(&audio_tensor, 2);
  print_audio(&audio_tensor, 100);
  print_audio(&audio_tensor, 101);
  print_audio(&audio_tensor, 102);

  //println!("\n\n>>> Audio tensor:\n{:?}\n\n", mel_tensor);

  let audio_signal = audio_tensor_to_audio_signal(audio_tensor);

  print_audio_signal(&audio_signal, 0);
  print_audio_signal(&audio_signal, 1);
  print_audio_signal(&audio_signal, 2);
  print_audio_signal(&audio_signal, 100);
  print_audio_signal(&audio_signal, 101);
  print_audio_signal(&audio_signal, 102);

  let audio_bytes = audio_signal_to_wav_bytes(audio_signal);
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

  //let tacotron = "/home/bt/dev/voder/tacotron_melgan/tacotron_jit_model_voder_c0cac635.pt";
  let tacotron = "/home/bt/dev/voder/tacotron_melgan/tacotron_container4.pt";
  //let melgan = "/home/bt/dev/voder/tacotron_melgan/melgan_jit_model_voder_c0cac635.pt";
  let melgan = "/home/bt/dev/voder/tacotron_melgan/melgan_container2.pt";
  let melgan = "/home/bt/dev/tacotron-melgan/shared_melgan_container.pt";
  let melgan = "/home/bt/dev/tacotron-melgan/shared_melgan_container2.pt";
  let model = TacoMelModel::create(
    tacotron,
    melgan);

  rocket::ignite()
      .mount("/", routes![
          get_index,
          get_tts,
          get_tts_test,
      ])
      .manage(model)
      .register(catchers![not_found])
      .launch();
}



