use std::collections::{HashMap, HashSet};
use once_cell::sync::Lazy;
use tts_common::priority::{FAKEYOU_ANONYMOUS_PRIORITY_LEVEL, FAKEYOU_LOGGED_IN_PRIORITY_LEVEL};
use crate::configs::plans::plan::Plan;
use crate::configs::plans::plan_builder::PlanBuilder;
use crate::configs::plans::plan_category::PlanCategory;

pub static FREE_LOGGED_OUT_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("free_logged_out")
        .plan_category(PlanCategory::Free)
        .tts_base_priority_level(FAKEYOU_ANONYMOUS_PRIORITY_LEVEL)
        .build()
});

pub static FREE_LOGGED_IN_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("free_logged_in")
        .plan_category(PlanCategory::Free)
        .tts_base_priority_level(FAKEYOU_LOGGED_IN_PRIORITY_LEVEL)
        .build()
});

/// This plan is for users that create models for us but don't pay.
pub static LOYALTY_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("loyalty_plan")
        .plan_category(PlanCategory::LoyaltyReward)
        .tts_base_priority_level(2)
        .build()
});

pub static PREMIUM_PLANS : Lazy<HashSet<Plan>> = Lazy::new(|| {
    let mut plans = HashSet::new();

    // ========== English plans ==========

    plans.insert(PlanBuilder::new("fakeyou_en_basic")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(5)
        .tts_base_priority_level(10)
        .build());

    plans.insert(PlanBuilder::new("fakeyou_en_pro")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(15)
        .tts_base_priority_level(20)
        .build());


    // ========== Spanish plans ==========

    plans.insert(PlanBuilder::new("fakeyou_es_basic")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(3)
        .tts_base_priority_level(5)
        .build());

    plans.insert(PlanBuilder::new("fakeyou_es_pro")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(7)
        .tts_base_priority_level(11)
        .build());

    plans
});

