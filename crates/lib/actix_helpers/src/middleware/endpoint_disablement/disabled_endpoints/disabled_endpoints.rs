use std::sync::Arc;
use crate::middleware::endpoint_disablement::disabled_endpoints::exact_match_endpoint_disablements::ExactMatchEndpointDisablements;
use crate::middleware::endpoint_disablement::disabled_endpoints::prefix_endpoint_disablements::PrefixEndpointDisablements;

#[derive(Clone)]
pub struct DisabledEndpoints {
  exact_match_endpoints: Arc<ExactMatchEndpointDisablements>,
  prefix_endpoints: Arc<PrefixEndpointDisablements>,
}

impl DisabledEndpoints {

  pub fn new(exact_match: ExactMatchEndpointDisablements, prefix: PrefixEndpointDisablements) -> Self {
    Self {
      exact_match_endpoints: Arc::new(exact_match),
      prefix_endpoints: Arc::new(prefix),
    }
  }

  pub fn endpoint_is_disabled(&self, endpoint: &str) -> bool {
    if self.exact_match_endpoints.endpoint_is_disabled(endpoint) {
      true
    } else if self.prefix_endpoints.endpoint_is_disabled(endpoint) {
      true
    } else {
      false
    }
  }
}
