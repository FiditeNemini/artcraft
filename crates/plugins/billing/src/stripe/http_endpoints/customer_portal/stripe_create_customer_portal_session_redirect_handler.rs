use actix_http::header;
use actix_web::{HttpRequest, HttpResponse, web};
use actix_web::web::Query;
use crate::stripe::http_endpoints::customer_portal::stripe_create_customer_portal_session_error::CreateCustomerPortalSessionError;
use crate::stripe::http_endpoints::customer_portal::stripe_create_customer_portal_session_shared::stripe_create_customer_portal_session_shared;
use crate::stripe::stripe_config::StripeConfig;
use crate::stripe::traits::internal_product_to_stripe_lookup::InternalProductToStripeLookup;
use crate::stripe::traits::internal_user_lookup::InternalUserLookup;
use url_config::third_party_url_redirector::ThirdPartyUrlRedirector;

// =============== Request ===============

#[derive(Deserialize)]
pub struct QueryParams {
    // TODO: In the future, perhaps obscure this with well-known slugs
    /// The stripe portal configuration ID.
    /// This controls which plans can be switched to.
    portal_config_id: Option<String>,
}

pub async fn stripe_create_customer_portal_session_redirect_handler(
    http_request: HttpRequest,
    query: Query<QueryParams>,
    stripe_config: web::Data<StripeConfig>,
    stripe_client: web::Data<stripe::Client>,
    url_redirector: web::Data<ThirdPartyUrlRedirector>,
    internal_product_to_stripe_lookup: web::Data<dyn InternalProductToStripeLookup>,
    internal_user_lookup: web::Data<dyn InternalUserLookup>,
) -> Result<HttpResponse, CreateCustomerPortalSessionError>
{
    let portal_config_id = query.portal_config_id
        .as_deref()
        .unwrap_or(&stripe_config.portal.default_portal_config_id)
        .to_string();

    let redirect_url = stripe_create_customer_portal_session_shared(
        http_request,
        stripe_config,
        stripe_client,
        url_redirector,
        internal_product_to_stripe_lookup,
        internal_user_lookup,
        &portal_config_id,
    ).await?;

    Ok(HttpResponse::Found()
        .append_header((header::LOCATION, redirect_url))
        .finish())
}
