use actix_cors::Cors;
use crate::util::netlify_branch_domain_matches::netlify_branch_domain_matches;

pub fn add_artcraft_website(cors: Cors, _is_production: bool) -> Cors {
  cors
      // Actual domains
      .allowed_origin("https://getartcraft.com")
      .allowed_origin("https://www.getartcraft.com")
      // Hypothetical domains
      .allowed_origin("https://artcraft.ai")
      .allowed_origin("https://www.artcraft.ai")
      // Netlify project
      .allowed_origin_fn(|origin, _req_head| {
        netlify_branch_domain_matches(origin, "artcraft-website.netlify.app")
      })
}
