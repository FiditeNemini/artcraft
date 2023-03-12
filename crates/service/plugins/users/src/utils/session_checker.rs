// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use actix_web::HttpRequest;
use log::warn;
use container_common::anyhow_result::AnyhowResult;
use crate::utils::session_cookie_manager::SessionCookieManager;
use crate::utils::user_session_extended::{UserSessionExtended, UserSessionPreferences, UserSessionPremiumPlanInfo, UserSessionRoleAndPermissions, UserSessionSubscriptionPlan, UserSessionUserDetails};
use database_queries::queries::users::user_sessions::get_user_session_by_token::{get_user_session_by_token, SessionUserRecord};
use database_queries::queries::users::user_sessions::get_user_session_by_token_light::{get_user_session_by_token_light, SessionRecord};
use database_queries::queries::users::user_subscriptions::list_active_user_subscriptions::list_active_user_subscriptions;
use redis_caching::redis_ttl_cache::{RedisTtlCache, RedisTtlCacheConnection};
use sqlx::pool::PoolConnection;
use sqlx::{MySqlPool, MySql};

#[derive(Clone)]
pub struct SessionChecker {
  cookie_manager: SessionCookieManager,
  maybe_redis_ttl_cache: Option<RedisTtlCache>,
}

impl SessionChecker {

  pub fn new(cookie_manager: &SessionCookieManager) -> Self {
    Self {
      cookie_manager: cookie_manager.clone(),
      maybe_redis_ttl_cache: None,
    }
  }

  pub fn new_with_cache(cookie_manager: &SessionCookieManager, redis_ttl_cache: RedisTtlCache) -> Self {
    Self {
      cookie_manager: cookie_manager.clone(),
      maybe_redis_ttl_cache: Some(redis_ttl_cache),
    }
  }


  // ==================== SessionRecord ====================

  #[deprecated = "Use the PoolConnection<MySql> method instead of the MySqlPool one."]
  pub async fn maybe_get_session_light(
    &self,
    request: &HttpRequest,
    pool: &MySqlPool
  ) -> AnyhowResult<Option<SessionRecord>>
  {
    let mut connection = pool.acquire().await?;
    self.maybe_get_session_light_from_connection(request, &mut connection).await
  }

  pub async fn maybe_get_session_light_from_connection(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<SessionRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    get_user_session_by_token_light(mysql_connection, &session_token).await
  }

  async fn maybe_get_session_light_from_connection_cached(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<SessionRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    let maybe_redis_cache = self.maybe_get_redis_cache_connection();

    match maybe_redis_cache {
      None => {
        get_user_session_by_token_light(mysql_connection, &session_token).await
      }
      Some(mut redis_ttl_cache) => {
        let cache_key = "todo";
        redis_ttl_cache.lazy_load_if_not_cached(cache_key, move || {
          //let session_token2 = session_token.to_string(); // TODO FIXME
          get_user_session_by_token_light(mysql_connection, "")
        }).await
      }
    }
  }


  // ==================== SessionUserRecord ====================

  //#[deprecated = "Use the PoolConnection<MySql> method instead of the MySqlPool one."]
  pub async fn maybe_get_user_session(
    &self,
    request: &HttpRequest,
    pool: &MySqlPool,
  ) -> AnyhowResult<Option<SessionUserRecord>>
  {
    let mut connection = pool.acquire().await?;
    self.maybe_get_user_session_from_connection(request, &mut connection).await
  }

  pub async fn maybe_get_user_session_from_connection(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<SessionUserRecord>>
  {
    let session_token = match self.cookie_manager.decode_session_token_from_request(request)? {
      None => return Ok(None),
      Some(session_token) => session_token,
    };

    get_user_session_by_token(mysql_connection, &session_token).await
  }


  // ==================== UserSessionExtended ====================

  //#[deprecated = "Use the PoolConnection<MySql> method instead of the MySqlPool one."]
  pub async fn maybe_get_user_session_extended(
    &self,
    request: &HttpRequest,
    pool: &MySqlPool,
  ) -> AnyhowResult<Option<UserSessionExtended>>
  {
    let mut connection = pool.acquire().await?;
    self.maybe_get_user_session_extended_from_connection(request, &mut connection).await
  }

  pub async fn maybe_get_user_session_extended_from_connection(
    &self,
    request: &HttpRequest,
    mysql_connection: &mut PoolConnection<MySql>,
  ) -> AnyhowResult<Option<UserSessionExtended>>
  {
    let session_payload= match self.cookie_manager.decode_session_payload_from_request(request)? {
      None => return Ok(None),
      Some(session_payload) => session_payload,
    };

    // TODO: Fire both requests off simultaneously.
    let user_session = {
      match get_user_session_by_token(mysql_connection, &session_payload.session_token).await? {
        None => return Ok(None),
        Some(u) => u,
      }
    };

    // TODO: Cache this so we don't hit the database twice.
    let subscriptions =
        list_active_user_subscriptions(mysql_connection, &user_session.user_token).await?;

    Ok(Some(UserSessionExtended {
      user_token: user_session.user_token,
      user: UserSessionUserDetails {
        username: user_session.username,
        display_name: user_session.display_name,
        email_address: user_session.email_address,
        email_confirmed: user_session.email_confirmed,
        email_gravatar_hash: user_session.email_gravatar_hash,
      },
      premium: UserSessionPremiumPlanInfo {
        maybe_stripe_customer_id: user_session.maybe_stripe_customer_id,
        maybe_loyalty_program_key: user_session.maybe_loyalty_program_key,
        subscription_plans: subscriptions.into_iter()
            .map(|subscription| {
              UserSessionSubscriptionPlan {
                subscription_namespace: subscription.subscription_namespace,
                subscription_product_slug: subscription.subscription_product_slug,
                subscription_expires_at: subscription.subscription_expires_at,
              }
            })
            .collect::<Vec<UserSessionSubscriptionPlan>>()
      },
      preferences: UserSessionPreferences {
        disable_gravatar: user_session.disable_gravatar,
        auto_play_audio_preference: user_session.auto_play_audio_preference,
        preferred_tts_result_visibility: user_session.preferred_tts_result_visibility,
        preferred_w2l_result_visibility: user_session.preferred_w2l_result_visibility,
        auto_play_video_preference: user_session.auto_play_video_preference,
      },
      role: UserSessionRoleAndPermissions {
        user_role_slug: user_session.user_role_slug,
        is_banned: user_session.is_banned,
        can_use_tts: user_session.can_use_tts,
        can_use_w2l: user_session.can_use_w2l,
        can_delete_own_tts_results: user_session.can_delete_own_tts_results,
        can_delete_own_w2l_results: user_session.can_delete_own_w2l_results,
        can_delete_own_account: user_session.can_delete_own_account,
        can_upload_tts_models: user_session.can_upload_tts_models,
        can_upload_w2l_templates: user_session.can_upload_w2l_templates,
        can_delete_own_tts_models: user_session.can_delete_own_tts_models,
        can_delete_own_w2l_templates: user_session.can_delete_own_w2l_templates,
        can_approve_w2l_templates: user_session.can_approve_w2l_templates,
        can_edit_other_users_profiles: user_session.can_edit_other_users_profiles,
        can_edit_other_users_tts_models: user_session.can_edit_other_users_tts_models,
        can_edit_other_users_w2l_templates: user_session.can_edit_other_users_w2l_templates,
        can_delete_other_users_tts_models: user_session.can_delete_other_users_tts_models,
        can_delete_other_users_tts_results: user_session.can_delete_other_users_tts_results,
        can_delete_other_users_w2l_templates: user_session.can_delete_other_users_w2l_templates,
        can_delete_other_users_w2l_results: user_session.can_delete_other_users_w2l_results,
        can_ban_users: user_session.can_ban_users,
        can_delete_users: user_session.can_delete_users,
      },
    }))
  }

  fn maybe_get_redis_cache_connection(&self) -> Option<RedisTtlCacheConnection> {
    self.maybe_redis_ttl_cache
        .as_ref()
        .map(|redis_ttl_cache| redis_ttl_cache.get_connection()
            .map_err(|err| {
              warn!("redis cache failure: {:?}", err); // NB: We'll fail open if Redis cache fails
              err
            })
            .ok())
        .flatten()
  }
}

