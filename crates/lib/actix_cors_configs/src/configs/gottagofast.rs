use actix_cors::Cors;

pub fn add_gotta_go_fast_test_branches(cors: Cors, _is_production: bool) -> Cors {
  cors.allowed_origin("http://localhost:5173")
      .allowed_origin("https://pipeline-gottagofast.netlify.app")
      .allowed_origin("https://test--pipeline-gottagofast.netlify.app")
}
