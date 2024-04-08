use actix_cors::Cors;
use log::warn;
use url::{Host, Url};

pub fn add_gotta_go_fast_test_branches(cors: Cors, _is_production: bool) -> Cors {
  cors.allowed_origin("http://localhost:5173")
      .allowed_origin("https://pipeline-gottagofast.netlify.app")
      .allowed_origin("https://test--pipeline-gottagofast.netlify.app")
      // Allow Netlify domains within "gottagofast" project.
      .allowed_origin_fn(|origin, _req_head| {
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
          Some(Host::Domain(domain)) => {
            let is_netlify_domain = domain == "pipeline-gottagofast.netlify.app";
            let is_netlify_branch_deploy = domain.ends_with("--pipeline-gottagofast.netlify.app");

            is_netlify_domain || is_netlify_branch_deploy
          },
          _ => false,
        }
      })
}

//

#[cfg(test)]
mod tests {
  use reusable_types::server_environment::ServerEnvironment;

  use crate::cors::build_cors_config;
  use crate::testing::assert_origin_invalid;
  use crate::testing::assert_origin_ok;

  #[actix_rt::test]
  async fn gotta_go_fast_main() {
    let production_cors = build_cors_config(ServerEnvironment::Production);
    assert_origin_ok(&production_cors, "https://pipeline-gottagofast.netlify.app").await;
  }

  #[actix_rt::test]
  async fn gotta_go_fast_branch_deploy() {
    let production_cors = build_cors_config(ServerEnvironment::Production);
    assert_origin_ok(&production_cors, "https://test--pipeline-gottagofast.netlify.app").await;
  }

  #[actix_rt::test]
  async fn gotta_go_fast_deploy_preview() {
    let production_cors = build_cors_config(ServerEnvironment::Production);
    assert_origin_ok(&production_cors, "https://deploy-preview-86--pipeline-gottagofast.netlify.app").await;
  }

  #[actix_rt::test]
  async fn invalid_netlify_preview_deploy() {
    let production_cors = build_cors_config(ServerEnvironment::Production);
    assert_origin_invalid(&production_cors, "https://deploy-preview-86--unrelated-project.netlify.app").await;
  }
}
