use chrono::Duration;
use crate::configs::plans::plan::Plan;
use crate::configs::plans::plan_category::PlanCategory;

const TTS_DEFAULT_PRIORITY_LEVEL : u8 = 0;
const TTS_DEFAULT_DURATION_SECONDS : i64 = 12;

const VC_DEFAULT_MAX_CONCURRENT_MODELS : u32 = 5;

const VC_DEFAULT_PRE_RECORDED_TIME_LIMIT_SECONDS : i64 = 20;
const VC_DEFAULT_REAL_TIME_TIME_LIMIT_SECONDS : i64 = 20;

const W2L_DEFAULT_TIME_LIMIT_SECONDS : i64 = 20;

#[derive(Clone)]
pub struct PlanBuilder {
    pub plan_name: String,
    pub plan_category: PlanCategory,
    pub cost_per_month_dollars: Option<u32>,
    pub stripe_product_id: Option<String>,
    pub stripe_price_id: Option<String>,
    pub is_development_plan: bool,

    // ========== Features for TTS ==========

    pub tts_base_priority_level: u8,
    pub tts_max_duration: Duration,
    pub tts_can_generate_mp3: bool,
    pub tts_can_upload_private_models: bool,
    pub tts_can_share_private_models: bool,

    // ========== Features for Voice Conversion ==========

    pub vc_max_concurrent_models: u32,

    pub vc_pre_recorded_time_limit: Duration,
    pub vc_pre_recorded_time_is_unlimited: bool,

    pub vc_real_time_time_limit: Duration,
    pub vc_real_time_time_is_unlimited: bool,

    // ========== Features for W2L ==========

    pub w2l_max_duration: Duration,
    pub w2l_can_turn_off_watermark: bool,
}

impl PlanBuilder {
    pub fn new(plan_name: &str) -> Self {
        // NB: Not using default() since that seems dangerous when we want to be explicit.
        PlanBuilder {
            plan_name : plan_name.to_string(),
            plan_category : PlanCategory::Free,
            cost_per_month_dollars: None,
            stripe_product_id: None,
            stripe_price_id: None,
            is_development_plan: false,

            // TTS
            tts_base_priority_level : TTS_DEFAULT_PRIORITY_LEVEL,
            tts_max_duration: Duration::seconds(TTS_DEFAULT_DURATION_SECONDS),
            tts_can_generate_mp3 : false,
            tts_can_upload_private_models: false,
            tts_can_share_private_models : false,

            // VC
            vc_max_concurrent_models: VC_DEFAULT_MAX_CONCURRENT_MODELS,
            vc_pre_recorded_time_limit: Duration::seconds(VC_DEFAULT_PRE_RECORDED_TIME_LIMIT_SECONDS),
            vc_pre_recorded_time_is_unlimited: false,
            vc_real_time_time_limit: Duration::seconds(VC_DEFAULT_REAL_TIME_TIME_LIMIT_SECONDS),
            vc_real_time_time_is_unlimited: false,

            // W2L
            w2l_max_duration: Duration::seconds(W2L_DEFAULT_TIME_LIMIT_SECONDS),
            w2l_can_turn_off_watermark: false
        }
    }

    pub fn build(&self) -> Plan {
        Plan::from_builder(self)
    }

    pub fn plan_category(mut self, value: PlanCategory) -> Self {
        self.plan_category = value;
        self
    }

    pub fn cost_per_month_dollars(mut self, value: u32) -> Self {
        self.cost_per_month_dollars = Some(value);
        self
    }

    pub fn stripe_product_id(mut self, value: &str) -> Self {
        self.stripe_product_id = Some(value.to_string());
        self
    }

    pub fn stripe_price_id(mut self, value: &str) -> Self {
        self.stripe_price_id = Some(value.to_string());
        self
    }

    pub fn is_development_plan(mut self, value: bool) -> Self {
        self.is_development_plan = value;
        self
    }

    pub fn tts_base_priority_level(mut self, value: u8) -> Self {
        self.tts_base_priority_level = value;
        self
    }

    pub fn tts_max_duration_seconds(mut self, value: i64) -> Self {
        self.tts_max_duration = Duration::seconds(value);
        self
    }

    pub fn tts_can_generate_mp3(mut self, value: bool) -> Self {
        self.tts_can_generate_mp3 = value;
        self
    }

    pub fn tts_can_upload_private_models(mut self, value: bool) -> Self {
        self.tts_can_upload_private_models = value;
        self
    }

    pub fn tts_can_share_private_models(mut self, value: bool) -> Self {
        self.tts_can_share_private_models = value;
        self
    }

    pub fn vc_max_concurrent_models(mut self, value: u32) -> Self {
        self.vc_max_concurrent_models = value;
        self
    }

    pub fn vc_pre_recorded_time_limit_seconds(mut self, value: i64) -> Self {
        self.vc_pre_recorded_time_limit = Duration::seconds(value);
        self
    }

    pub fn vc_pre_recorded_time_is_unlimited(mut self, value: bool) -> Self {
        self.vc_pre_recorded_time_is_unlimited = value;
        if value {
            self.vc_pre_recorded_time_limit = Duration::seconds(60 * 60 * 24 * 7);
        }
        self
    }

    pub fn vc_real_time_time_limit_seconds(mut self, value: i64) -> Self {
        self.vc_real_time_time_limit = Duration::seconds(value);
        self
    }

    pub fn vc_real_time_time_is_unlimited(mut self, value: bool) -> Self {
        self.vc_real_time_time_is_unlimited = value;
        if value {
            self.vc_real_time_time_limit = Duration::seconds(60 * 60 * 24 * 7);
        }
        self
    }

    pub fn w2l_time_limit_seconds(mut self, value: i64) -> Self {
        self.w2l_max_duration = Duration::seconds(value);
        self
    }

    pub fn w2l_can_turn_off_watermark(mut self, value: bool) -> Self {
        self.w2l_can_turn_off_watermark = value;
        self
    }
}
