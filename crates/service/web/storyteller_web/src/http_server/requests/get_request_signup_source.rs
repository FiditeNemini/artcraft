use actix_helpers::extractors::get_request_origin_uri::get_request_origin_uri;
use actix_web::HttpRequest;
use log::warn;

const FAKEYOU : &str = "fakeyou";
const STORYTELLER : &str = "storyteller";

/// This is for the users table `maybe_source` field which is populated during account creation.
/// While we could back this with an enum, there may be a motivation to use this VARCHAR(255) field 
/// for more robust payloads and user tracking in the future.
pub fn get_request_signup_source(http_request: &HttpRequest) -> Option<&'static str> {
  let maybe_origin = get_request_origin_uri(&http_request);

  match maybe_origin {
    Ok(Some(uri)) => {
      if let Some(host) = uri.host() {
        if host.contains(STORYTELLER) {
          return Some(STORYTELLER);
        } else if host.contains(FAKEYOU) {
          return Some(FAKEYOU);
        }
      }
    }
    // Fail open for now.
    Ok(None) => {}
    Err(err) => {
      warn!("Origin header error: {:?}", err);
    }
  }

  None
}

#[cfg(test)]
mod tests {
  use crate::http_server::requests::get_request_signup_source::get_request_signup_source;
  use actix_web::test::TestRequest;

  mod origin_header {
    use super::*;

    #[test]
    fn fakeyou_dot_com() {
      let request = TestRequest::get()
          .insert_header(("origin", "fakeyou.com"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("fakeyou"));
    }

    #[test]
    fn api_dot_fakeyou_dot_com() {
      let request = TestRequest::get()
          .insert_header(("origin", "api.fakeyou.com"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("fakeyou"));
    }

    #[test]
    fn storyteller_dot_ai() {
      let request = TestRequest::get()
          .insert_header(("origin", "storyteller.ai"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("storyteller"));
    }

    #[test]
    fn api_dot_storyteller_dot_ai() {
      let request = TestRequest::get()
          .insert_header(("origin", "api.storyteller.ai"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("storyteller"));
    }
  }


  mod host_header {
    use super::*;

    #[test]
    fn fakeyou_dot_com() {
      let request = TestRequest::get()
          .insert_header(("host", "fakeyou.com"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("fakeyou"));
    }

    #[test]
    fn api_dot_fakeyou_dot_com() {
      let request = TestRequest::get()
          .insert_header(("host", "api.fakeyou.com"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("fakeyou"));
    }

    #[test]
    fn storyteller_dot_ai() {
      let request = TestRequest::get()
          .insert_header(("host", "storyteller.ai"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("storyteller"));
    }

    #[test]
    fn api_dot_storyteller_dot_ai() {
      let request = TestRequest::get()
          .insert_header(("host", "api.storyteller.ai"))
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("storyteller"));
    }
  }

  mod uri {
    use super::*;

    #[test]
    fn fakeyou_dot_com() {
      let request = TestRequest::get()
          .uri("https://fakeyou.com")
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("fakeyou"));
    }

    #[test]
    fn api_dot_fakeyou_dot_com() {
      let request = TestRequest::get()
          .uri("https://api.fakeyou.com")
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("fakeyou"));
    }

    #[test]
    fn storyteller_dot_ai() {
      let request = TestRequest::get()
          .uri("https://storyteller.ai")
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("storyteller"));
    }

    #[test]
    fn api_dot_storyteller_dot_ai() {
      let request = TestRequest::get()
          .uri("https://api.storyteller.ai")
          .to_http_request();
      assert_eq!(get_request_signup_source(&request), Some("storyteller"));
    }
  }
}
