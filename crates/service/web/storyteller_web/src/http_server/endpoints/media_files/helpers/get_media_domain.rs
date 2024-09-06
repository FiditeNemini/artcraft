use actix_web::HttpRequest;

use crate::http_server::common_responses::media_links::MediaDomain;
use crate::http_server::requests::get_request_domain_branding::{DomainBranding, get_request_domain_branding};

pub fn get_media_domain(http_request: &HttpRequest) -> MediaDomain {
  get_request_domain_branding(http_request)
      .map(|domain| match domain {
          DomainBranding::FakeYou => MediaDomain::FakeYou,
          DomainBranding::Storyteller => MediaDomain::Storyteller,
      })
      .unwrap_or(MediaDomain::FakeYou)
}
