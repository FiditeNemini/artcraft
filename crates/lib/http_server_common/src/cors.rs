use actix_cors::Cors;
use actix_http::http;

// TODO: Take an environment.
/// Return cors config for FakeYou / Vocodes / OBS / local development
pub fn build_common_cors_config() -> Cors {
  Cors::default()
      // Local Development
      .allowed_origin("http://api.jungle.horse")
      .allowed_origin("http://jungle.horse")
      .allowed_origin("http://jungle.horse:12345")
      .allowed_origin("http://jungle.horse:7000")
      .allowed_origin("http://localhost:12345")
      .allowed_origin("http://localhost:3000")
      .allowed_origin("http://localhost:54321")
      .allowed_origin("http://localhost:5555")
      .allowed_origin("http://localhost:7000")
      .allowed_origin("http://localhost:8000")
      .allowed_origin("http://localhost:8080")
      .allowed_origin("https://api.jungle.horse")
      .allowed_origin("https://jungle.horse")
      // FakeYou
      .allowed_origin("http://api.fakeyou.com")
      .allowed_origin("http://fakeyou.com")
      .allowed_origin("https://api.fakeyou.com")
      .allowed_origin("https://fakeyou.com")
      // Storyteller
      .allowed_origin("http://api.storyteller.io")
      .allowed_origin("http://storyteller.io")
      .allowed_origin("https://api.storyteller.io")
      .allowed_origin("https://storyteller.io")
      // Trumped (legacy)
      .allowed_origin("http://trumped.com")
      .allowed_origin("https://trumped.com")
      // Vocodes (legacy)
      .allowed_origin("http://api.vo.codes")
      .allowed_origin("http://mumble.stream")
      .allowed_origin("http://vo.codes")
      .allowed_origin("http://vocodes.com")
      .allowed_origin("https://api.vo.codes")
      .allowed_origin("https://mumble.stream")
      .allowed_origin("https://vo.codes")
      .allowed_origin("https://vocodes.com")
      // Remaining setup
      .allowed_methods(vec!["GET", "POST", "OPTIONS"])
      .supports_credentials()
      .allowed_headers(vec![
        http::header::ACCEPT,
        http::header::ACCESS_CONTROL_ALLOW_ORIGIN, // Tabulator Ajax
        http::header::CONTENT_TYPE,
        http::header::ACCESS_CONTROL_ALLOW_CREDENTIALS, // https://stackoverflow.com/a/46412839
        http::header::HeaderName::from_static("x-requested-with") // Tabulator Ajax sends
      ])
      .max_age(3600)
}