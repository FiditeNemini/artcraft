use actix_web::{App, web, HttpResponse};
use actix_http::body::MessageBody;
use actix_service::ServiceFactory;
use actix_web::dev::{ServiceRequest, ServiceResponse};
use actix_web::error::Error;
use crate::http_server::endpoints::categories::create_category::create_category_handler;
use crate::http_server::endpoints::events::list_events::list_events_handler;
use crate::http_server::endpoints::leaderboard::get_leaderboard::leaderboard_handler;
use crate::http_server::endpoints::misc::default_route_404::default_route_404;
use crate::http_server::endpoints::misc::enable_alpha_easy_handler::enable_alpha_easy_handler;
use crate::http_server::endpoints::misc::enable_alpha_handler::enable_alpha_handler;
use crate::http_server::endpoints::misc::root_index::get_root_index;
use crate::http_server::endpoints::moderation::approval::pending_w2l_templates::get_pending_w2l_templates_handler;
use crate::http_server::endpoints::moderation::ip_bans::add_ip_ban::add_ip_ban_handler;
use crate::http_server::endpoints::moderation::ip_bans::delete_ip_ban::delete_ip_ban_handler;
use crate::http_server::endpoints::moderation::ip_bans::get_ip_ban::get_ip_ban_handler;
use crate::http_server::endpoints::moderation::ip_bans::list_ip_bans::list_ip_bans_handler;
use crate::http_server::endpoints::moderation::jobs::get_tts_inference_queue_count::get_tts_inference_queue_count_handler;
use crate::http_server::endpoints::moderation::jobs::get_w2l_inference_queue_count::get_w2l_inference_queue_count_handler;
use crate::http_server::endpoints::moderation::stats::get_voice_count_stats::get_voice_count_stats_handler;
use crate::http_server::endpoints::moderation::user_bans::ban_user::ban_user_handler;
use crate::http_server::endpoints::moderation::user_bans::list_banned_users::list_banned_users_handler;
use crate::http_server::endpoints::moderation::user_roles::list_roles::list_user_roles_handler;
use crate::http_server::endpoints::moderation::user_roles::list_staff::list_staff_handler;
use crate::http_server::endpoints::moderation::user_roles::set_user_role::set_user_role_handler;
use crate::http_server::endpoints::moderation::users::list_users::list_users_handler;
use crate::http_server::endpoints::tts::delete_tts_model::delete_tts_model_handler;
use crate::http_server::endpoints::tts::delete_tts_result::delete_tts_inference_result_handler;
use crate::http_server::endpoints::tts::edit_tts_model::edit_tts_model_handler;
use crate::http_server::endpoints::tts::edit_tts_result::edit_tts_inference_result_handler;
use crate::http_server::endpoints::tts::enqueue_infer_tts::infer_tts_handler;
use crate::http_server::endpoints::tts::enqueue_upload_tts_model::upload_tts_model_handler;
use crate::http_server::endpoints::tts::get_tts_inference_job_status::get_tts_inference_job_status_handler;
use crate::http_server::endpoints::tts::get_tts_model::get_tts_model_handler;
use crate::http_server::endpoints::tts::get_tts_model_use_count::get_tts_model_use_count_handler;
use crate::http_server::endpoints::tts::get_tts_result::get_tts_inference_result_handler;
use crate::http_server::endpoints::tts::get_tts_upload_model_job_status::get_tts_upload_model_job_status_handler;
use crate::http_server::endpoints::tts::list_tts_models::list_tts_models_handler;
use crate::http_server::endpoints::users::create_account::create_account_handler;
use crate::http_server::endpoints::users::edit_profile::edit_profile_handler;
use crate::http_server::endpoints::users::get_profile::get_profile_handler;
use crate::http_server::endpoints::users::list_user_tts_inference_results::list_user_tts_inference_results_handler;
use crate::http_server::endpoints::users::list_user_tts_models::list_user_tts_models_handler;
use crate::http_server::endpoints::users::list_user_w2l_inference_results::list_user_w2l_inference_results_handler;
use crate::http_server::endpoints::users::list_user_w2l_templates::list_user_w2l_templates_handler;
use crate::http_server::endpoints::users::login::login_handler;
use crate::http_server::endpoints::users::logout::logout_handler;
use crate::http_server::endpoints::users::session_info::session_info_handler;
use crate::http_server::endpoints::w2l::delete_w2l_result::delete_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::delete_w2l_template::delete_w2l_template_handler;
use crate::http_server::endpoints::w2l::edit_w2l_result::edit_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::edit_w2l_template::edit_w2l_template_handler;
use crate::http_server::endpoints::w2l::enqueue_infer_w2l::infer_w2l_handler;
use crate::http_server::endpoints::w2l::enqueue_infer_w2l_with_uploads::enqueue_infer_w2l_with_uploads;
use crate::http_server::endpoints::w2l::enqueue_upload_w2l_template::upload_w2l_template_handler;
use crate::http_server::endpoints::w2l::get_w2l_inference_job_status::get_w2l_inference_job_status_handler;
use crate::http_server::endpoints::w2l::get_w2l_result::get_w2l_inference_result_handler;
use crate::http_server::endpoints::w2l::get_w2l_template::get_w2l_template_handler;
use crate::http_server::endpoints::w2l::get_w2l_template_use_count::get_w2l_template_use_count_handler;
use crate::http_server::endpoints::w2l::get_w2l_upload_template_job_status::get_w2l_upload_template_job_status_handler;
use crate::http_server::endpoints::w2l::list_w2l_templates::list_w2l_templates_handler;
use crate::http_server::endpoints::w2l::set_w2l_template_mod_approval::set_w2l_template_mod_approval_handler;
use crate::http_server::endpoints::categories::delete_category::delete_category_handler;
use crate::http_server::endpoints::categories::edit_category::edit_category_handler;
use crate::http_server::endpoints::categories::list_tts_categories::list_tts_categories_handler;

pub fn add_routes<T, B> (app: App<T, B>) -> App<T, B>
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
  let mut app = add_moderator_routes(app); /* /moderation */
  app = add_tts_routes(app); /* /tts */
  app = add_w2l_routes(app); /* /w2l */
  app = add_category_routes(app); /* /category */
  app = add_user_profile_routes(app); /* /user */

  // ==================== ACCOUNT CREATION / SESSION MANAGEMENT ====================
  app.service(
    web::resource("/create_account")
        .route(web::post().to(create_account_handler))
        .route(web::head().to(|| HttpResponse::Ok()))
  )
  .service(
    web::resource("/login")
        .route(web::post().to(login_handler))
        .route(web::head().to(|| HttpResponse::Ok()))
  )
  .service(
    web::resource("/logout")
        .route(web::post().to(logout_handler))
        .route(web::head().to(|| HttpResponse::Ok()))
  )
  .service(
    web::resource("/session")
        .route(web::get().to(session_info_handler))
        .route(web::head().to(|| HttpResponse::Ok()))
  )
  // ==================== MISC ====================
  .service(
    web::resource("/events")
        .route(web::get().to(list_events_handler))
        .route(web::head().to(|| HttpResponse::Ok()))
  )
  .service(
    web::resource("/leaderboard")
        .route(web::get().to(leaderboard_handler))
        .route(web::head().to(|| HttpResponse::Ok()))
  )
  .service(web::resource("/")
      .route(web::get().to(get_root_index))
      .route(web::head().to(|| HttpResponse::Ok()))
  )
  .service(enable_alpha_handler)
  .service(enable_alpha_easy_handler)
  .default_service( web::route().to(default_route_404))
}

// ==================== MODERATOR ROUTES ====================

fn add_moderator_routes<T, B> (app: App<T, B>) -> App<T, B>
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
  app.service(
  web::scope("/moderation")
      .service(
        web::resource("/staff")
            .route(web::get().to(list_staff_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::scope("/ip_bans")
            .service(
              web::resource("/list")
                  .route(web::get().to(list_ip_bans_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/add")
                  .route(web::post().to(add_ip_ban_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/{ip_address}")
                  .route(web::get().to(get_ip_ban_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/{ip_address}/delete")
                  .route(web::post().to(delete_ip_ban_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
      .service(
        web::scope("/user")
            .service(
              web::resource("/list")
                  .route(web::get().to(list_users_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
      .service(
        web::scope("/user_bans")
            .service(
              web::resource("/list")
                  .route(web::get().to(list_banned_users_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/manage_ban")
                  .route(web::post().to(ban_user_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
      .service(
        web::scope("/roles")
            .service(
              web::resource("/list")
                  .route(web::get().to(list_user_roles_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/{username}/edit")
                  .route(web::post().to(set_user_role_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
      .service(
        web::scope("/jobs")
            .service(
              web::resource("/tts_inference_queue_stats")
                  .route(web::get().to(get_tts_inference_queue_count_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/w2l_inference_queue_stats")
                  .route(web::get().to(get_w2l_inference_queue_count_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
      .service(
        web::scope("/pending")
            .service(
              web::resource("/w2l_templates")
                  .route(web::get().to(get_pending_w2l_templates_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
            .service(
              web::resource("/w2l_inference_queue_stats")
                  .route(web::get().to(get_w2l_inference_queue_count_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
      .service(
        web::scope("/stats")
            .service(
              web::resource("/tts_voices")
                  .route(web::get().to(get_voice_count_stats_handler))
                  .route(web::head().to(|| HttpResponse::Ok()))
            )
      )
  )
}

// ==================== TTS ROUTES ====================

fn add_tts_routes<T, B> (app: App<T, B>) -> App<T, B>
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
  app.service(
  web::scope("/tts")
      .service(
        web::resource("/upload")
            .route(web::post().to(upload_tts_model_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/inference")
            .route(web::post().to(infer_tts_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/list")
            .route(web::get().to(list_tts_models_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/model/{token}")
            .route(web::get().to(get_tts_model_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/model/{token}/delete")
            .route(web::post().to(delete_tts_model_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/model/{model_token}/count")
            .route(web::get().to(get_tts_model_use_count_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/model/{model_token}/edit")
            .route(web::post().to(edit_tts_model_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/result/{token}")
            .route(web::get().to(get_tts_inference_result_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/result/{token}/edit")
            .route(web::post().to(edit_tts_inference_result_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/result/{token}/delete")
            .route(web::post().to(delete_tts_inference_result_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/job/{token}")
            .route(web::get().to(get_tts_inference_job_status_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/upload_model_job/{token}")
            .route(web::get().to(get_tts_upload_model_job_status_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
  )
}

// ==================== WAV2LIP ROUTES ====================

fn add_w2l_routes<T, B> (app: App<T, B>) -> App<T, B>
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
  app.service(
    web::scope("/w2l")
      .service(
        web::resource("/upload")
            .route(web::post().to(upload_w2l_template_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/inference")
            .route(web::post().to(enqueue_infer_w2l_with_uploads))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/list")
            .route(web::get().to(list_w2l_templates_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/template/{token}")
            .route(web::get().to(get_w2l_template_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/template/{template_token}/count")
            .route(web::get().to(get_w2l_template_use_count_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/template/{template_token}/edit")
            .route(web::post().to(edit_w2l_template_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/template/{token}/moderate")
            .route(web::post().to(set_w2l_template_mod_approval_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/template/{token}/delete")
            .route(web::post().to(delete_w2l_template_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/result/{token}")
            .route(web::get().to(get_w2l_inference_result_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/result/{token}/edit")
            .route(web::post().to(edit_w2l_inference_result_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/result/{token}/delete")
            .route(web::post().to(delete_w2l_inference_result_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/job/{token}")
            .route(web::get().to(get_w2l_inference_job_status_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/upload_template_job/{token}")
            .route(web::get().to(get_w2l_upload_template_job_status_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
  )
}

// ==================== CATEGORY ROUTES ====================

fn add_category_routes<T, B> (app: App<T, B>) -> App<T, B>
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
  app.service(
    web::scope("/category")
        .service(
          web::resource("/create")
              .route(web::post().to(create_category_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
        )
        .service(
          web::resource("/{token}/delete")
              .route(web::post().to(delete_category_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
        )
        .service(
          web::resource("/{token}/edit")
              .route(web::post().to(edit_category_handler))
              .route(web::head().to(|| HttpResponse::Ok()))
        )
        .service(
          web::scope("/list")
              .service(
                web::resource("/tts")
                    .route(web::get().to(list_tts_categories_handler))
                    .route(web::head().to(|| HttpResponse::Ok()))
              )
        )
  )
}

// ==================== USER PROFILE ROUTES ====================

fn add_user_profile_routes<T, B> (app: App<T, B>) -> App<T, B>
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
  app.service(
  web::scope("/user")
      .service(
        web::resource("/{username}/profile")
            .route(web::get().to(get_profile_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/{username}/edit_profile")
            .route(web::post().to(edit_profile_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/{username}/tts_models")
            .route(web::get().to(list_user_tts_models_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/{username}/tts_results")
            .route(web::get().to(list_user_tts_inference_results_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/{username}/w2l_templates")
            .route(web::get().to(list_user_w2l_templates_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
      .service(
        web::resource("/{username}/w2l_results")
            .route(web::get().to(list_user_w2l_inference_results_handler))
            .route(web::head().to(|| HttpResponse::Ok()))
      )
  )
}
