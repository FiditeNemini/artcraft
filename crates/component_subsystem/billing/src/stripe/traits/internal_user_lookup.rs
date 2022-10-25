#[cfg(test)]
use mockall::{automock, mock, predicate::*};

use actix_web::HttpRequest;
use async_trait::async_trait;
use sqlx::MySqlPool;
use std::error::Error;
use std::fmt::{Display, Formatter};

/// Errors for this component are not strongly typed.
#[derive(Debug)]
pub enum InternalUserLookupError {
    NotAuthorizedError,
    ServerError,
    UncategorizedError { description: String },
}

impl Display for InternalUserLookupError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            InternalUserLookupError::NotAuthorizedError => {
                write!(f, "InternalUserLookupError::NotAuthorizedError")
            }
            InternalUserLookupError::ServerError => {
                write!(f, "InternalUserLookupError::ServerError")
            }
            InternalUserLookupError::UncategorizedError { description } => {
                write!(f, "InternalUserLookupError::UncategorizedError: {}", description)
            }
        }
    }
}

impl Error for InternalUserLookupError {}

#[derive(Clone, Default)]
pub struct UserMetadata {
    /// Internal system primary key identifier of the user.
    /// We will associate this to Stripe objects if available.
    pub user_token: Option<String>,

    /// Internal system username for the user.
    /// We will associate this to Stripe objects if available.
    pub username: Option<String>,

    /// Internal system email for the user.
    /// We will associate this to Stripe objects if available.
    pub user_email: Option<String>,
}

/// Allows us to inject a user lookup from the HTTP request's session info and database backend,
/// then translate these into the pieces we need for the billing component.
#[cfg_attr(test, automock)]
#[async_trait(?Send)] // NB: Marking async_trait as not needing Sync/Send. Hopefully this doesn't blow up on us.
pub trait InternalUserLookup {

    /// Lookup a user's session details from an HTTP request, then return the
    /// relevant pieces for the Stripe integration.
    async fn lookup_user_from_http_request(&self, http_request: &HttpRequest) -> Result<Option<UserMetadata>, InternalUserLookupError>;
}
