use actix_helpers::route_builder::RouteBuilder;
use actix_web::{App, HttpResponse, HttpServer, web};
use async_openai::Client;
use crate::persistence::save_directory::SaveDirectory;
use crate::shared_state::app_control_state::AppControlState;
use crate::web_server::handlers::get_next_audio_file_handler::get_next_audio_file_handler;
use crate::web_server::handlers::next_audio_file_handler::next_audio_file_handler;
use crate::web_server::handlers::openai_inference_handler::openai_inference_handler;
use crate::web_server::server_state::ServerState;
use errors::AnyhowResult;
use http_server_common::endpoints::root_index::get_root_index;
use std::sync::Arc;

pub struct LaunchWebServerArgs {
  pub app_control_state: Arc<AppControlState>,
  pub openai_client: Arc<Client>,
  pub save_directory: SaveDirectory,
}

pub async fn launch_web_server(args: LaunchWebServerArgs) -> AnyhowResult<()> {

  let server_state = Arc::new(ServerState {
    app_control_state: args.app_control_state.clone(),
    openai_client: args.openai_client.clone(),
    save_directory: args.save_directory,
  });

  HttpServer::new(move || {
    let app = App::new()
        .app_data(web::Data::new(args.app_control_state.clone()))
        .app_data(web::Data::new(args.openai_client.clone()))
        .app_data(web::Data::new(server_state.clone()));

    let mut route_builder = RouteBuilder::from_app(app);

    let app = route_builder
        .add_get("/", get_root_index)
        .add_get("/get_next_audio", get_next_audio_file_handler)
        .add_post("/next_audio", next_audio_file_handler)
        .add_get("/openai", openai_inference_handler)
        .into_app();

    /*app.service(
      web::resource("/next")
          .route(web::get().to(get_next_audio_file_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
    )
    .service(
      web::resource("/next")
          .route(web::get().to(get_next_audio_file_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
    )*/

    app
  })
      .bind("localhost:23333")?
      .workers(8)
      .run()
      .await?;

  Ok(())
}