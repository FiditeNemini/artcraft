use actix_cors::Cors;

use crate::util::netlify_branch_domain_matches::netlify_branch_domain_matches;

pub fn add_video_compositor(cors: Cors, _is_production: bool) -> Cors {
  cors.allowed_origin_fn(|origin, _req_head| {
        netlify_branch_domain_matches(origin, "storyteller-board.netlify.app")
      })
      .allowed_origin("http://localhost:5173/")
}

#[cfg(test)]
mod tests {
  use reusable_types::server_environment::ServerEnvironment;

  use crate::cors::build_cors_config;
  use crate::testing::assert_origin_invalid;
  use crate::testing::assert_origin_ok;

  mod netlify {
    use super::*;

    #[actix_rt::test]
    async fn netlify_main() {
      let production_cors = build_cors_config(ServerEnvironment::Production);
      assert_origin_ok(&production_cors, "https://storyteller-board.netlify.app").await;
    }

    #[actix_rt::test]
    async fn netlify_branch_deploy() {
      let production_cors = build_cors_config(ServerEnvironment::Production);
      assert_origin_ok(&production_cors, "https://test--storyteller-board.netlify.app").await;
    }

    #[actix_rt::test]
    async fn netlify_deploy_preview() {
      let production_cors = build_cors_config(ServerEnvironment::Production);
      assert_origin_ok(&production_cors, "https://deploy-preview-123--storyteller-board.netlify.app").await;
    }

    #[actix_rt::test]
    async fn invalid_netlify_preview_deploy() {
      let production_cors = build_cors_config(ServerEnvironment::Production);
      assert_origin_invalid(&production_cors, "https://storyteller-board--unrelated.netlify.app").await;
      assert_origin_invalid(&production_cors, "https://deploy-preview-123--unrelated.netlify.app").await;
    }
  }
}
