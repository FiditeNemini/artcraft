use chrono::{DateTime, Utc};
use database_queries::column_types::record_visibility::RecordVisibility;

#[derive(Clone)]
pub struct UserSessionExtended {
    pub user_token: String,
    pub user: UserSessionUserDetails,
    pub premium: UserSessionPremiumPlanInfo,
    pub preferences: UserSessionPreferences,
    pub role: UserSessionRoleAndPermissions,
}

#[derive(Clone)]
pub struct UserSessionUserDetails {
    pub username: String,
    pub display_name: String,
    pub email_address: String,
    pub email_confirmed: bool,
    pub email_gravatar_hash: String,
}

#[derive(Clone)]
pub struct UserSessionPremiumPlanInfo {
    pub maybe_stripe_customer_id: Option<String>,
    pub maybe_loyalty_program_key: Option<String>,
    pub subscription_plans: Vec<UserSessionSubscriptionPlan>,
}

#[derive(Clone)]
pub struct UserSessionSubscriptionPlan {
    /// The category or namespace for the product, eg "fakeyou" or "powerstream".
    pub subscription_namespace: String,

    /// The key for the product in our internal system (not a stripe id),
    /// eg. "fakeyou_en_pro" or "stream_package_plus".
    pub subscription_product_slug: String,

    /// This is the authoritative timestamp for when the subscription expires.
    /// If a session is cached, there may be *expired* premium plans in this list.
    /// The caller must check that the date of each plan is after the current time.
    pub subscription_expires_at: DateTime<Utc>,
}

#[derive(Clone)]
pub struct UserSessionPreferences {
    pub disable_gravatar: bool,
    pub auto_play_audio_preference: Option<bool>,
    pub preferred_tts_result_visibility: RecordVisibility,
    pub preferred_w2l_result_visibility: RecordVisibility,
    pub auto_play_video_preference: Option<bool>,
}

#[derive(Clone)]
pub struct UserSessionRoleAndPermissions {
    // ===== ROLE ===== //
    pub user_role_slug: String,
    pub is_banned: bool,

    // ===== PERMISSIONS FLAGS ===== //
    // Usage
    pub can_use_tts: bool,
    pub can_use_w2l: bool,
    pub can_delete_own_tts_results: bool,
    pub can_delete_own_w2l_results: bool,
    pub can_delete_own_account: bool,

    // Contribution
    pub can_upload_tts_models: bool,
    pub can_upload_w2l_templates: bool,
    pub can_delete_own_tts_models: bool,
    pub can_delete_own_w2l_templates: bool,

    // Moderation
    pub can_approve_w2l_templates: bool,
    pub can_edit_other_users_profiles: bool,
    pub can_edit_other_users_tts_models: bool,
    pub can_edit_other_users_w2l_templates: bool,
    pub can_delete_other_users_tts_models: bool,
    pub can_delete_other_users_tts_results: bool,
    pub can_delete_other_users_w2l_templates: bool,
    pub can_delete_other_users_w2l_results: bool,
    pub can_ban_users: bool,
    pub can_delete_users: bool,
}
