use actix_web::middleware::Logger;
use actix_web::{App, HttpResponse, HttpServer, middleware, web};
use crate::http_server::endpoints::health_check_handler::get_health_check_handler;
use crate::http_server::http_server_shared_state::HttpServerSharedState;
use crate::job_dependencies::JobDependencies;
use errors::AnyhowResult;
use log::info;
use std::sync::Arc;

const DEFAULT_BIND_ADDRESS : &'static str = "0.0.0.0:12345";
const DEFAULT_NUM_WORKERS : usize = 4;

pub async fn run_http_server(job_dependencies: &JobDependencies) -> AnyhowResult<()>
{
  // HTTP server args
  let bind_address = easyenv::get_env_string_or_default("HTTP_BIND_ADDRESS", DEFAULT_BIND_ADDRESS);
  let num_workers = easyenv::get_env_num("HTTP_NUM_WORKERS", DEFAULT_NUM_WORKERS)?;
  let hostname = job_dependencies.container.hostname.clone();

  let server_state = HttpServerSharedState {
    job_stats: job_dependencies.job_stats.clone(),
  };

  let server_state_arc = web::Data::new(Arc::new(server_state));

  info!("Starting HTTP service (just for k8s health checking).");

  // NB: We shouldn't be logging much as the /_status endpoint is all we aim to expose.
  let log_format = "[%{HOSTNAME}e] IP=[%{X-Forwarded-For}i] \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T";

  HttpServer::new(move || {
    // NB: app_data being clone()'d below should all be safe (dependencies included)
    App::new()
        .app_data(server_state_arc.clone())
        .wrap(Logger::new(&log_format)
            .exclude("/_status")
        )
        .wrap(middleware::Compress::default())
        .service(
          web::resource("/_status")
              .route(web::post().to(get_health_check_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
        )
  })
      .bind(bind_address)?
      .workers(num_workers)
      .run()
      .await?;

  Ok(())
}
