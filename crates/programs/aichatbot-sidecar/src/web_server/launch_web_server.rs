use actix_web::{App, HttpResponse, HttpServer, web};
use crate::web_server::get_next_audio_file_handler::get_next_audio_file_handler;
use errors::AnyhowResult;

pub async fn launch_web_server() -> AnyhowResult<()> {
  HttpServer::new(move || {
    let app = App::new();
        //.app_data(web::Data::new(server_state_arc.firehose_publisher.clone()))

    app.service(
      web::resource("/next")
          .route(web::get().to(get_next_audio_file_handler))
          .route(web::head().to(|| HttpResponse::Ok()))
    )
  })
      .bind("localhost:23333")?
      .workers(8)
      .run()
      .await?;

  Ok(())
}