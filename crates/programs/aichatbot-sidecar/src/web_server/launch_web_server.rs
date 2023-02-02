use std::sync::Arc;
use actix_helpers::route_builder::RouteBuilder;
use actix_web::{App, HttpResponse, HttpServer, web};
use crate::web_server::handlers::get_next_audio_file_handler::get_next_audio_file_handler;
use errors::AnyhowResult;
use http_server_common::endpoints::root_index::get_root_index;
use crate::shared_state::control_state::ControlState;
use crate::web_server::server_state::ServerState;

pub async fn launch_web_server(control_state: Arc<ControlState>) -> AnyhowResult<()> {

  let server_state = Arc::new(ServerState {
    control_state: control_state.clone(),
  });

  HttpServer::new(move || {
    let app = App::new()
        .app_data(web::Data::new(control_state.clone()))
        .app_data(web::Data::new(server_state.clone()));

    let mut route_builder = RouteBuilder::from_app(app);

    let app = route_builder
        .add_get("/", get_root_index)
        .add_get("/next", get_next_audio_file_handler)
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