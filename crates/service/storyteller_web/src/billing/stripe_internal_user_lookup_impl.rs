use actix_web::HttpRequest;
use async_trait::async_trait;
use billing_component::stripe::traits::internal_user_lookup::{InternalUserLookup, InternalUserLookupError, UserMetadata};
use crate::MySqlPool;
use database_queries::queries::users::user_sessions::get_session_by_token::SessionUserRecord;
use log::warn;
use users_component::utils::session_checker::SessionChecker;

/// A simple Actix injectable action
#[derive(Clone)]
pub struct StripeInternalUserLookupImpl {
    session_checker: SessionChecker,
    mysql_pool: MySqlPool,
}

impl StripeInternalUserLookupImpl {
    pub fn new(session_checker: SessionChecker, mysql_pool: MySqlPool) -> Self {
        Self {
            session_checker,
            mysql_pool,
        }
    }
}

// NB: Marking async_trait as not needing Sync/Send. Hopefully this doesn't blow up on us.
#[async_trait(?Send)]
impl InternalUserLookup for StripeInternalUserLookupImpl {
    async fn lookup_user_from_http_request(&self, http_request: &HttpRequest) -> Result<Option<UserMetadata>, InternalUserLookupError> {
        let mut mysql_connection = self.mysql_pool.acquire()
            .await
            .map_err(|e| {
                warn!("Could not acquire DB pool: {:?}", e);
                InternalUserLookupError::ServerError
            })?;

        let maybe_user_session = self.session_checker
            .maybe_get_user_session_from_connection(&http_request, &mut mysql_connection)
            .await
            .map_err(|e| {
                warn!("Session checker error: {:?}", e);
                InternalUserLookupError::ServerError
            })?;

        match maybe_user_session {
            None => Ok(None),
            Some(user_session) => Ok(Some(UserMetadata {
                user_token: user_session.user_token,
                username: Some(user_session.username),
                user_email: Some(user_session.email_address),
                maybe_existing_stripe_customer_id: user_session.maybe_stripe_customer_id,
            })),
        }
    }
}

