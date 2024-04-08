use actix_cors::Cors;

pub fn add_storyteller(cors: Cors, is_production: bool) -> Cors {
  if is_production {
    cors
        // Storyteller Engine (Production)
        .allowed_origin("https://engine.storyteller.ai")
        // Storyteller.ai (Production)
        .allowed_origin("https://api.storyteller.ai")
        .allowed_origin("https://storyteller.ai")
        // Storyteller.ai (Staging)
        .allowed_origin("https://staging.storyteller.ai")
        // Storyteller.ai (Netlify Staging / Production)
        .allowed_origin("https://feature-marketing--storyteller-ai.netlify.app")
        .allowed_origin("https://feature-mvp--storyteller-ai.netlify.app")

        // NB(bt,2024-04-07): We shouldn't allow HTTP from non-dev hosts
        //.allowed_origin("http://api.storyteller.ai")
        //.allowed_origin("http://staging.storyteller.ai")
        //.allowed_origin("http://storyteller.ai")
  } else {
    cors
        // Storyteller.ai (Development)
        .allowed_origin("http://dev.storyteller.ai")
        .allowed_origin("http://dev.storyteller.ai:5173") // NB: Wil's port
        .allowed_origin("http://dev.storyteller.ai:7000") // Yarn default port
        .allowed_origin("http://dev.storyteller.ai:7001") // NB: Mac frontend
        .allowed_origin("http://dev.storyteller.ai:7002") // NB: Mac frontend
        .allowed_origin("https://dev.storyteller.ai")
        .allowed_origin("https://dev.storyteller.ai:5173") // NB: Wil's port
        .allowed_origin("https://dev.storyteller.ai:7000") // Yarn default port
        .allowed_origin("https://dev.storyteller.ai:7001") // NB: Mac frontend
        .allowed_origin("https://dev.storyteller.ai:7002") // NB: Mac frontend
  }
}

pub fn add_storyteller_dev_proxy(cors: Cors, _is_production: bool) -> Cors {
  cors
      // Storyteller.ai (Development Proxy)
      .allowed_origin("http://devproxy.storyteller.ai")
      .allowed_origin("http://devproxy.storyteller.ai:5173")
      .allowed_origin("http://devproxy.storyteller.ai:7000")
      .allowed_origin("http://devproxy.storyteller.ai:7001")
      .allowed_origin("http://devproxy.storyteller.ai:7002")
      .allowed_origin("https://devproxy.storyteller.ai")
      .allowed_origin("https://devproxy.storyteller.ai:5173")
      .allowed_origin("https://devproxy.storyteller.ai:7000")
      .allowed_origin("https://devproxy.storyteller.ai:7001")
      .allowed_origin("https://devproxy.storyteller.ai:7002")
}
