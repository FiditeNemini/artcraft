use actix_cors::Cors;

pub fn add_fakeyou(cors: Cors, is_production: bool) -> Cors {
  if is_production {
    cors
        // Storyteller Engine (Production)
        .allowed_origin("https://engine.fakeyou.com")
        // FakeYou (Production)
        .allowed_origin("https://api.fakeyou.com")
        .allowed_origin("https://fakeyou.com")
        // FakeYou (Staging)
        .allowed_origin("https://staging.fakeyou.com")
        // FakeYou (Netlify Staging / Production)
        .allowed_origin("https://feature-mvp--fakeyou.netlify.app")
        .allowed_origin("https://feature-marketing--fakeyou.netlify.app")

        // NB(bt,2024-04-07): We shouldn't allow HTTP from non-dev hosts
        //.allowed_origin("http://api.fakeyou.com")
        //.allowed_origin("http://fakeyou.com")
        //.allowed_origin("http://staging.fakeyou.com")
  } else {
    cors
        // FakeYou (Development)
        .allowed_origin("http://dev.fakeyou.com")
        .allowed_origin("http://dev.fakeyou.com:7000") // Yarn default port
        .allowed_origin("http://dev.fakeyou.com:7001") // NB: Mac frontend
        .allowed_origin("https://dev.fakeyou.com")
        .allowed_origin("https://dev.fakeyou.com:7000") // Yarn default port
        .allowed_origin("https://dev.fakeyou.com:7001") // NB: Mac frontend
        // Storyteller Engine (Development)
        .allowed_origin("https://engine.fakeyou.com") // NB: We use prod for integration testing
  }
}

pub fn add_fakeyou_dev_proxy(cors: Cors, _is_production: bool) -> Cors {
  cors
      // Storyteller.ai (Development Proxy)
      .allowed_origin("http://devproxy.fakeyou.com")
      .allowed_origin("http://devproxy.fakeyou.com:5173")
      .allowed_origin("http://devproxy.fakeyou.com:7000")
      .allowed_origin("http://devproxy.fakeyou.com:7001")
      .allowed_origin("http://devproxy.fakeyou.com:7002")
      .allowed_origin("https://devproxy.fakeyou.com")
      .allowed_origin("https://devproxy.fakeyou.com:5173")
      .allowed_origin("https://devproxy.fakeyou.com:7000")
      .allowed_origin("https://devproxy.fakeyou.com:7001")
      .allowed_origin("https://devproxy.fakeyou.com:7002")
}
