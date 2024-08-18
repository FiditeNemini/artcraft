use actix_web::http::header::HOST;
use actix_web::HttpRequest;
use log::info;

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum DomainBranding {
  FakeYou,
  Storyteller,
}

pub fn get_request_domain_branding(http_request: &HttpRequest) -> Option<DomainBranding> {
  // NB: http_request.uri() does not include the hostname - it only includes the path (!)
  let maybe_host_header = http_request.headers()
      .get(HOST)
      .map(|header| header.to_str().ok())
      .flatten();

  if let Some(branding) = match_possible_hostname(maybe_host_header) {
    info!("Host header: {:?} Branding for hostname: {:?}", maybe_host_header, branding);
    return Some(branding);
  }

  // NB: This may not actually work against real requests. It fails in local dev. See above comment.
  let maybe_hostname = http_request.uri().host();

  if let Some(branding) = match_possible_hostname(maybe_hostname) {
    info!("URI hostname: {:?} Branding for hostname: {:?}", maybe_hostname, branding);
    return Some(branding);
  }

  None
}

fn match_possible_hostname(maybe_hostname: Option<&str>) -> Option<DomainBranding> {
  let hostname = match maybe_hostname {
    Some(hostname) => hostname,
    None => return None,
  };
  match hostname {
    host if host.contains("fakeyou") => Some(DomainBranding::FakeYou),
    host if host.contains("storyteller") => Some(DomainBranding::Storyteller),
    _ => None,
  }
}

#[cfg(test)]
mod tests {
  use actix_web::test::TestRequest;

  use crate::http_server::requests::get_request_domain_branding::{DomainBranding, get_request_domain_branding};

  mod host_header {
    use super::*;

    #[test]
    fn fakeyou_dot_com() {
      let request = TestRequest::get()
          .insert_header(("host", "fakeyou.com"))
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::FakeYou));
    }

    #[test]
    fn api_dot_fakeyou_dot_com() {
      let request = TestRequest::get()
          .insert_header(("host", "api.fakeyou.com"))
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::FakeYou));
    }

    #[test]
    fn storyteller_dot_ai() {
      let request = TestRequest::get()
          .insert_header(("host", "storyteller.ai"))
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::Storyteller));
    }

    #[test]
    fn api_dot_storyteller_dot_ai() {
      let request = TestRequest::get()
          .insert_header(("host", "api.storyteller.ai"))
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::Storyteller));
    }
  }

  mod uri {
    use super::*;

    #[test]
    fn fakeyou_dot_com() {
      let request = TestRequest::get()
          .uri("https://fakeyou.com")
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::FakeYou));
    }

    #[test]
    fn api_dot_fakeyou_dot_com() {
      let request = TestRequest::get()
          .uri("https://api.fakeyou.com")
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::FakeYou));
    }

    #[test]
    fn storyteller_dot_ai() {
      let request = TestRequest::get()
          .uri("https://storyteller.ai")
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::Storyteller));
    }

    #[test]
    fn api_dot_storyteller_dot_ai() {
      let request = TestRequest::get()
          .uri("https://api.storyteller.ai")
          .to_http_request();
      assert_eq!(get_request_domain_branding(&request), Some(DomainBranding::Storyteller));
    }
  }
}
