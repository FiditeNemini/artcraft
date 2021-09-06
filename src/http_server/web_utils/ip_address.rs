use actix_web::HttpRequest;
use actix_web::dev::ServiceRequest;
use log::{info};
use actix_web::http::{HeaderMap, HeaderName};
use std::str::FromStr;

pub fn get_request_ip(request: &HttpRequest) -> String {
  let headers = request.headers();
  let maybe_x_forwarded = get_ip_from_header(headers, "x-forwarded-for");
  let maybe_forwarded = get_ip_from_header(headers, "forwarded");

  info!("(1) x-forwarded-for: {:?}, forwarded: {:?}", maybe_x_forwarded, maybe_forwarded);

  let maybe_ip = maybe_x_forwarded.or(maybe_forwarded);

  match maybe_ip {
    Some(ip_address) => ip_address,
    None => {
      // If we're running without the upstream Rust proxy, we can grab 'x-forarded-for', which is
      // populated by the DigitalOcean load balancer.
      let ip_address_and_port = request.connection_info()
        .remote_addr()
        .unwrap_or("")
        .to_string();
      let ip_address = ip_address_and_port.split(":")
        .collect::<Vec<&str>>()
        .get(0)
        .copied()
        .unwrap_or("")
        .to_string();
      info!("Forwarded IP address (1): {}", &ip_address);
      ip_address
    },
  }
}

// TODO: De-duplicate
pub fn get_service_request_ip(request: &ServiceRequest) -> String {
  let headers = request.headers();
  let maybe_x_forwarded = get_ip_from_header(headers, "x-forwarded-for");
  let maybe_forwarded = get_ip_from_header(headers, "forwarded");

  info!("(2) x-forwarded-for: {:?}, forwarded: {:?}", maybe_x_forwarded, maybe_forwarded);

  let maybe_ip = maybe_x_forwarded.or(maybe_forwarded);

  match maybe_ip {
    Some(ip_address) => ip_address,
    None => {
      // If we're running without the upstream Rust proxy, we can grab 'x-forarded-for', which is
      // populated by the DigitalOcean load balancer.
      let ip_address_and_port = request.connection_info()
          .remote_addr()
          .unwrap_or("")
          .to_string();
      let ip_address = ip_address_and_port.split(":")
          .collect::<Vec<&str>>()
          .get(0)
          .copied()
          .unwrap_or("")
          .to_string();
      info!("(2) Forwarded IP address: {}", &ip_address);
      ip_address
    },
  }
}

fn get_ip_from_header(headers: &HeaderMap, header_name: &str) -> Option<String> {
  if let Ok(header_name) = HeaderName::from_str(header_name) {
    headers.get(&header_name)
      .and_then(|value| value.to_str().ok())
      .map(|v| v.to_string())
  } else {
    None
  }
}
