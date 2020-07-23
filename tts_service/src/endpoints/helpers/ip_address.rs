use actix_web::HttpRequest;
use actix_web::http::HeaderName;

pub fn get_request_ip(request: &HttpRequest) -> String{
  match request.headers().get(HeaderName::from_static("x-voder-proxy-for")) {
    Some(ip_address) => {
      // Unfortunately the upstream Rust proxy is replacing the `forwarded` and `x-forwarded-for`
      // headers, so we populate this custom header as a workaround.
      info!("Proxied IP address: {:?}", ip_address);
      ip_address.to_str()
          .unwrap_or("")
          .to_string()
    },
    None => {
      // If we're running without the upstream Rust proxy, we can grab 'x-forarded-for', which is
      // populated by the DigitalOcean load balancer.
      let ip_address_and_port = request.connection_info()
          .remote()
          .unwrap_or("")
          .to_string();
      let ip_address = ip_address_and_port.split(":")
          .collect::<Vec<&str>>()
          .get(0)
          .copied()
          .unwrap_or("")
          .to_string();
      info!("Forwarded IP address: {}", &ip_address);
      ip_address
    },
  }
}
