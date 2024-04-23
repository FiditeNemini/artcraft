use actix_http::body::MessageBody;
use actix_service::ServiceFactory;
use actix_web::{App, Error};
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_helpers::route_builder::RouteBuilder;
use crate::http_server::endpoints::inference_job::batch_get_inference_job_status_handler::batch_get_inference_job_status_handler;
use crate::http_server::endpoints::inference_job::get_inference_job_status_handler::get_inference_job_status_handler;
use crate::http_server::endpoints::inference_job::get_pending_inference_job_count_handler::get_pending_inference_job_count_handler;
use crate::http_server::endpoints::inference_job::list_session_jobs_handler::list_session_jobs_handler;
use crate::http_server::endpoints::inference_job::terminate_inference_job_handler::terminate_inference_job_handler;

pub fn add_job_routes<T, B> (app: App<T>) -> App<T>
  where
      B: MessageBody,
      T: ServiceFactory<
        ServiceRequest,
        Config = (),
        Response = ServiceResponse<B>,
        Error = Error,
        InitError = (),
      >,
{
  // NB(bt): New routes
  let mut app = RouteBuilder::from_app(app)
      .add_get("/v1/jobs/batch", batch_get_inference_job_status_handler)
      .add_get("/v1/jobs/session", list_session_jobs_handler)
      .add_get("/v1/jobs/job/{token}", get_inference_job_status_handler)
      .add_delete("/v1/jobs/job/{token}", terminate_inference_job_handler, true)
      .into_app();

  // NB(bt): Old routes (these must be supported for AI streamers).
  let mut app = RouteBuilder::from_app(app)
      .add_get("/v1/model_inference/job_status/{token}", get_inference_job_status_handler)
      .add_delete("/v1/model_inference/job/{token}", terminate_inference_job_handler, true)
      // NB: This is a legacy endpoint. There's a better comprehensive job status endpoint.
      .add_get("/v1/model_inference/queue_length", get_pending_inference_job_count_handler)
      .into_app();

  app
}
