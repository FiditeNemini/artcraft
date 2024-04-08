use std::net::Ipv4Addr;
use actix_cors::Cors;
use log::warn;
use url::{Host, Url};

pub fn add_development_only(cors: Cors) -> Cors {
  // Any localhost is allowed.
  cors.allowed_origin_fn(|origin, _req_head| {
        let maybe_url = origin.to_str()
            .map(|origin| Url::parse(origin));

        let url = match maybe_url {
          Ok(Ok(url)) => url,
          _ => {
            warn!("Invalid origin: {:?}", origin);
            return false
          },
        };

        match url.host() {
          Some(Host::Domain("localhost")) => true,
          Some(Host::Ipv4(Ipv4Addr::LOCALHOST)) => true,
          _ => false,
        }
      })
//      .allowed_origin("http://localhost:3000")
//      .allowed_origin("http://localhost:4200")
//      .allowed_origin("http://localhost:5555")
//      .allowed_origin("http://localhost:7000")
//      .allowed_origin("http://localhost:7001")
//      .allowed_origin("http://localhost:7002")
//      .allowed_origin("http://localhost:7003")
//      .allowed_origin("http://localhost:7004")
//      .allowed_origin("http://localhost:7005")
//      .allowed_origin("http://localhost:7006")
//      .allowed_origin("http://localhost:7007")
//      .allowed_origin("http://localhost:7008")
//      .allowed_origin("http://localhost:7009")
//      .allowed_origin("http://localhost:8000")
//      .allowed_origin("http://localhost:8080")
//      .allowed_origin("http://localhost:12345")
//      .allowed_origin("http://localhost:54321")
//      // Local Development (JungleHorse)
//      .allowed_origin("http://api.jungle.horse")
//      .allowed_origin("http://jungle.horse")
//      .allowed_origin("http://jungle.horse:12345")
//      .allowed_origin("http://jungle.horse:7000")
//      .allowed_origin("http://obs.jungle.horse")
//      .allowed_origin("http://ws.jungle.horse")
//      .allowed_origin("https://api.jungle.horse")
//      .allowed_origin("https://jungle.horse")
//      .allowed_origin("https://obs.jungle.horse")
//      .allowed_origin("https://ws.jungle.horse")
}

