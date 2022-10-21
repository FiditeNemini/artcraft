use chrono::Duration;
use crate::configs::plans::plan_builder::PlanBuilder;
use crate::configs::plans::plan_category::PlanCategory;


/// A Plan is either a free or premium plan.
/// Each plan corresponds to a certain level of service.
#[derive(Clone, Eq, PartialEq, Hash)]
pub struct Plan {
    /// Name of the plan
    plan_name: String,

    /// Whether the plan is free, paid, or loyalty-based
    plan_category: PlanCategory,

    /// Non-authoritative cost of the plan per month in USD equivalent.
    /// This is mostly for documentation. Stripe will remain the source
    /// of truth.
    cost_per_month_dollars: Option<u32>,

    /// For lookup against Stripe product ID
    stripe_product_id: Option<String>,

    /// For lookup against Stripe price ID
    stripe_price_id: Option<String>,

    /// Whether this plan is only active in development
    is_development_plan: bool,

    // ========== Features for TTS ==========

    tts_base_priority_level: u8,
    tts_max_duration: Duration,
    tts_can_generate_mp3: bool,
    tts_can_upload_private_models: bool,
    tts_can_share_private_models: bool,

    // ========== Features for Voice Conversion ==========

    vc_max_concurrent_models: u32,

    vc_pre_recorded_time_limit: Duration,
    vc_pre_recorded_time_is_unlimited: bool,

    vc_real_time_time_limit: Duration,
    vc_real_time_time_is_unlimited: bool,

    // ========== Features for W2L ==========

    w2l_max_duration: Duration,
    w2l_can_turn_off_watermark: bool,
}

impl Plan {
    pub fn from_builder(builder: &PlanBuilder) -> Self {
        Self {
            plan_name: builder.plan_name.clone(),
            plan_category: builder.plan_category,
            cost_per_month_dollars: builder.cost_per_month_dollars.clone(),
            stripe_product_id: builder.stripe_product_id.clone(),
            stripe_price_id: builder.stripe_price_id.clone(),
            is_development_plan: builder.is_development_plan,
            tts_base_priority_level: builder.tts_base_priority_level,
            tts_max_duration: builder.tts_max_duration,
            tts_can_generate_mp3: builder.tts_can_generate_mp3,
            tts_can_upload_private_models: builder.tts_can_upload_private_models,
            tts_can_share_private_models: builder.tts_can_share_private_models,
            vc_max_concurrent_models: builder.vc_max_concurrent_models,
            vc_pre_recorded_time_limit: builder.vc_pre_recorded_time_limit,
            vc_pre_recorded_time_is_unlimited: builder.vc_pre_recorded_time_is_unlimited,
            vc_real_time_time_limit: builder.vc_real_time_time_limit,
            vc_real_time_time_is_unlimited: builder.vc_real_time_time_is_unlimited,
            w2l_max_duration: builder.w2l_max_duration,
            w2l_can_turn_off_watermark: builder.w2l_can_turn_off_watermark,
        }
    }
}