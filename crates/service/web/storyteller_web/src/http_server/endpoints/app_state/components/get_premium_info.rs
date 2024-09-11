use billing_component::stripe::traits::internal_user_lookup::UserMetadata;
use utoipa::ToSchema;
use mysql_queries::queries::users::user_sessions::get_user_session_by_token::SessionUserRecord;
use crate::http_server::session::lookup::user_session_extended::UserSessionExtended;

#[derive(Serialize, ToSchema)]
pub struct AppStatePremiumInfo {
  /// If the user has premium perks. This can be the result of
  /// having *either* a loyalty perk or a paid subscription.
  pub user_has_premium: bool,

  /// If the user has free premium perks.
  /// This is from free loyalty program perks.
  pub user_has_free_premium: bool,

  /// If the user has paid for a premium subscription, this will
  /// be true. Loyalty perks are not considered paid.
  pub user_has_paid_premium: bool,

  /// If the user is in a loyalty tier, we'll return something here.
  /// Users that contribute models can get extra perks for free.
  pub maybe_loyalty_program: Option<String>,

  /// Information on any subscriptions the user has.
  pub active_subscriptions: Vec<AppStateSubscriptionProductKey>,
}

#[derive(Serialize, ToSchema)]
pub struct AppStateSubscriptionProductKey {
  /// This should always be "fakeyou".
  pub namespace: String,

  /// Possible values: fakeyou_plus, fakeyou_pro, fakeyou_elite, etc.
  pub product_slug: String,
}

pub fn get_premium_info(
  user_metadata: &UserSessionExtended,
) -> AppStatePremiumInfo {

  let maybe_loyalty_program = user_metadata
      .premium
      .maybe_loyalty_program_key
      .as_deref()
      .map(|lp| lp.to_string());

  let active_subscriptions = user_metadata
      .premium
      .subscription_plans
      .iter()
      .map(|sub| AppStateSubscriptionProductKey {
        // TODO: Is this correct? Should it be externally facing?
        namespace: sub.subscription_namespace.to_string(),
        product_slug: sub.subscription_product_slug.to_string(),
      })
      .collect::<Vec<_>>();

  let user_has_paid_premium = !active_subscriptions.is_empty();
  let user_has_free_premium = maybe_loyalty_program.is_some();
  let user_has_premium = user_has_paid_premium || user_has_free_premium;

  AppStatePremiumInfo {
    user_has_premium,
    user_has_free_premium,
    user_has_paid_premium,
    maybe_loyalty_program,
    active_subscriptions,
  }
}
