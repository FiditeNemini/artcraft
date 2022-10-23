use crate::configs::plans::plan::Plan;
use crate::configs::plans::plan::PlanBuilder;
use crate::configs::plans::plan_category::PlanCategory;
use once_cell::sync::Lazy;
use std::collections::{HashMap, HashSet};
use tts_common::priority::{FAKEYOU_ANONYMOUS_PRIORITY_LEVEL, FAKEYOU_LOGGED_IN_PRIORITY_LEVEL};

/// The plan for free logged-out users.
/// This is declared at the top level because it may need to be referenced directly.
pub static FREE_LOGGED_OUT_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("free_logged_out")
        .plan_category(PlanCategory::Free)
        .tts_base_priority_level(FAKEYOU_ANONYMOUS_PRIORITY_LEVEL)
        .build()
});

/// A plan for free logged-out users on their first few attempts at using the website.
/// This is declared at the top level because it may need to be referenced directly.
pub static FREE_LOGGED_OUT_FIRST_TRY_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("free_logged_out_first_try")
        .plan_category(PlanCategory::Free)
        .tts_base_priority_level(FAKEYOU_LOGGED_IN_PRIORITY_LEVEL) // NB: Same as logged-in free users.
        .build()
});

/// The plan for free logged-in users.
/// This is declared at the top level because it may need to be referenced directly.
pub static FREE_LOGGED_IN_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("free_logged_in")
        .plan_category(PlanCategory::Free)
        .tts_base_priority_level(FAKEYOU_LOGGED_IN_PRIORITY_LEVEL)
        .build()
});

/// This plan is for users that create models for us but don't pay.
/// This is declared at the top level because it may need to be referenced directly.
pub static LOYALTY_PLAN : Lazy<Plan> = Lazy::new(|| {
    PlanBuilder::new("loyalty_plan")
        .plan_category(PlanCategory::LoyaltyReward)
        .tts_base_priority_level(2)
        .tts_max_duration_seconds(30)
        .build()
});

// TODO: Add by-[stripe-product] lookup HashSets.

pub static DEVELOPMENT_PLANS : Lazy<HashSet<Plan>> = Lazy::new(|| {
    let mut plans = HashSet::new();

    // ========== English plans ==========

    plans.insert(PlanBuilder::new("development_fakeyou_en_plus")
        .is_development_plan(true)
        .plan_category(PlanCategory::Paid)
        .stripe_product_id("prod_MMxi2J5y69VPbO")
        .stripe_price_id("price_1LeDnKEU5se17MekVr1iYYNf")
        .cost_per_month_dollars(5)
        .tts_base_priority_level(10)
        .tts_max_duration_seconds(30)
        .build());

    plans.insert(PlanBuilder::new("development_fakeyou_en_pro")
        .is_development_plan(true)
        .plan_category(PlanCategory::Paid)
        .stripe_product_id("prod_MScAZa5uk5TfDY")
        .stripe_price_id("price_1LjgwIEU5se17MekzQZUHl9W")
        .cost_per_month_dollars(15)
        .tts_base_priority_level(20)
        .tts_max_duration_seconds(120)
        .build());

    plans
});

/// All premium / paid-for plans in the system.
pub static PREMIUM_PLANS : Lazy<HashSet<Plan>> = Lazy::new(|| {
    let mut plans = HashSet::new();

    // ========== English plans ==========

    plans.insert(PlanBuilder::new("fakeyou_en_plus")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(7)
        .tts_base_priority_level(10)
        .tts_max_duration_seconds(30)
        .build());

    plans.insert(PlanBuilder::new("fakeyou_en_pro")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(15)
        .tts_base_priority_level(20)
        .tts_max_duration_seconds(120)
        .build());

    // ========== Spanish plans ==========

    plans.insert(PlanBuilder::new("fakeyou_es_plus")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(3)
        .tts_base_priority_level(5)
        .tts_max_duration_seconds(30)
        .build());

    plans.insert(PlanBuilder::new("fakeyou_es_pro")
        .plan_category(PlanCategory::Paid)
        .cost_per_month_dollars(7)
        .tts_base_priority_level(15)
        .tts_max_duration_seconds(45)
        .build());

    plans
});

/// Every single plan in the system: free, paid, loyalty-based, and Stripe development plans.
pub static ALL_PLANS_BY_SLUG : Lazy<HashMap<String, Plan>> = Lazy::new(|| {
    let mut plans = HashMap::new();

    fn add_plan(plans: &mut HashMap<String, Plan>, plan: &Plan) {
        plans.insert(plan.plan_slug().to_string(), plan.clone());
    }

    add_plan(&mut plans, &FREE_LOGGED_OUT_PLAN);
    add_plan(&mut plans, &FREE_LOGGED_OUT_FIRST_TRY_PLAN);
    add_plan(&mut plans, &FREE_LOGGED_IN_PLAN);
    add_plan(&mut plans, &LOYALTY_PLAN);

    PREMIUM_PLANS.iter().for_each(|plan| add_plan(&mut plans, plan));
    DEVELOPMENT_PLANS .iter().for_each(|plan| add_plan(&mut plans, plan));

    plans
});

/// Every Stripe premium product by its Stripe product id.
pub static PLANS_BY_STRIPE_PRODUCT_ID : Lazy<HashMap<String, Plan>> = Lazy::new(|| {
    let mut plans = HashMap::new();

    ALL_PLANS_BY_SLUG.values()
        .for_each(|plan| {
            if let Some(stripe_product_id) = plan.stripe_product_id() {
                plans.insert(stripe_product_id.to_string(), plan.clone());
            }
        });

    plans
});

/// Every Stripe premium product by its Stripe price id.
pub static PLANS_BY_STRIPE_PRICE_ID : Lazy<HashMap<String, Plan>> = Lazy::new(|| {
    let mut plans = HashMap::new();

    ALL_PLANS_BY_SLUG.values()
        .for_each(|plan| {
            if let Some(stripe_price_id) = plan.stripe_price_id() {
                plans.insert(stripe_price_id.to_string(), plan.clone());
            }
        });

    plans
});

// TODO: Add tests to assert our expectations of each plan.

#[cfg(test)]
mod test {
    use crate::configs::plans::plan::Plan;
    use crate::configs::plans::plan_category::PlanCategory;
    use crate::configs::plans::plan_list::{ALL_PLANS_BY_SLUG, DEVELOPMENT_PLANS, PLANS_BY_STRIPE_PRICE_ID, PLANS_BY_STRIPE_PRODUCT_ID, PREMIUM_PLANS};
    use speculoos::prelude::*;

    // NB: We're being extremely careful in this test and all those that follow, essentially
    // making ourselves check twice when we make additions, removals, or other changes.
    #[test]
    fn test_number_of_plans_is_expected() {
        assert_eq!(10, ALL_PLANS_BY_SLUG.len());
    }

    #[test]
    fn test_number_of_production_plans_is_expected() {
        let production_plans = ALL_PLANS_BY_SLUG.values()
            .filter(|plan| !plan.is_development_plan())
            .collect::<Vec<&Plan>>();

        assert_eq!(8, production_plans.len());
    }

    #[test]
    fn test_number_of_development_plans_is_expected() {
        let development_plans = ALL_PLANS_BY_SLUG.values()
            .filter(|plan| plan.is_development_plan())
            .collect::<Vec<&Plan>>();

        assert_eq!(2, development_plans.len());
    }

    #[test]
    fn test_plans_by_stripe_product_id_are_expected() {
        let product_ids = PLANS_BY_STRIPE_PRODUCT_ID.keys()
            .map(|product_id| product_id.to_string())
            .collect::<Vec<String>>();

        let expected_product_ids = vec![
            "prod_MMxi2J5y69VPbO".to_string(), // NB: Development
            "prod_MScAZa5uk5TfDY".to_string(), // NB: Development
        ];

        assert_that(&product_ids).contains_all_of(&expected_product_ids.iter());
        assert_eq!(product_ids.len(), expected_product_ids.len());
    }

    #[test]
    fn test_plans_by_stripe_price_id_are_expected() {
        let price_ids = PLANS_BY_STRIPE_PRICE_ID.keys()
            .map(|price_id| price_id.to_string())
            .collect::<Vec<String>>();

        let expected_price_ids = vec![
            "price_1LjgwIEU5se17MekzQZUHl9W".to_string(), // NB: Development
            "price_1LeDnKEU5se17MekVr1iYYNf".to_string(), // NB: Development
        ];

        assert_that(&price_ids).contains_all_of(&expected_price_ids.iter());
        assert_eq!(price_ids.len(), expected_price_ids.len());
    }

    #[test]
    fn test_tts_base_priority_levels_are_expected() {
        // Free
        assert_eq!(0, ALL_PLANS_BY_SLUG.get("free_logged_out").unwrap().tts_base_priority_level());
        assert_eq!(1, ALL_PLANS_BY_SLUG.get("free_logged_out_first_try").unwrap().tts_base_priority_level());
        assert_eq!(1, ALL_PLANS_BY_SLUG.get("free_logged_in").unwrap().tts_base_priority_level());

        // Loyalty-based
        assert_eq!(2, ALL_PLANS_BY_SLUG.get("loyalty_plan").unwrap().tts_base_priority_level());

        // Premium
        assert_eq!(5, ALL_PLANS_BY_SLUG.get("fakeyou_es_plus").unwrap().tts_base_priority_level());
        assert_eq!(10, ALL_PLANS_BY_SLUG.get("fakeyou_en_plus").unwrap().tts_base_priority_level());
        assert_eq!(15, ALL_PLANS_BY_SLUG.get("fakeyou_es_pro").unwrap().tts_base_priority_level());
        assert_eq!(20, ALL_PLANS_BY_SLUG.get("fakeyou_en_pro").unwrap().tts_base_priority_level());
    }

    #[test]
    fn test_tts_max_durations_are_expected() {
        // Free
        assert_eq!(12, ALL_PLANS_BY_SLUG.get("free_logged_out").unwrap().tts_max_duration().num_seconds());
        assert_eq!(12, ALL_PLANS_BY_SLUG.get("free_logged_out_first_try").unwrap().tts_max_duration().num_seconds());
        assert_eq!(12, ALL_PLANS_BY_SLUG.get("free_logged_in").unwrap().tts_max_duration().num_seconds());

        // Loyalty-based
        assert_eq!(30, ALL_PLANS_BY_SLUG.get("loyalty_plan").unwrap().tts_max_duration().num_seconds());

        // Premium
        assert_eq!(30, ALL_PLANS_BY_SLUG.get("fakeyou_es_plus").unwrap().tts_max_duration().num_seconds());
        assert_eq!(30, ALL_PLANS_BY_SLUG.get("fakeyou_en_plus").unwrap().tts_max_duration().num_seconds());
        assert_eq!(45, ALL_PLANS_BY_SLUG.get("fakeyou_es_pro").unwrap().tts_max_duration().num_seconds());
        assert_eq!(120, ALL_PLANS_BY_SLUG.get("fakeyou_en_pro").unwrap().tts_max_duration().num_seconds());
    }

    // The following tests should not need to change much

    #[test]
    fn test_assert_all_premium_plans_are_paid() {
        let mut test_count = 0;

        PREMIUM_PLANS.iter().for_each(|plan| {
            assert_eq!(plan.plan_category(), PlanCategory::Paid);
            test_count += 1;
        });

        assert!(test_count > 1);
    }

    #[test]
    fn test_assert_all_development_stripe_plans_are_marked_development() {
        let mut test_count = 0;

        DEVELOPMENT_PLANS.iter().for_each(|plan| {
            assert!(plan.is_development_plan());
            test_count += 1;
        });

        assert!(test_count > 1);
    }

    #[test]
    fn test_assert_correct_key_for_plans_indexed_by_slug() {
        let mut test_count = 0;

        ALL_PLANS_BY_SLUG.iter().for_each(|(slug, plan)| {
            assert_eq!(slug, plan.plan_slug());
            test_count += 1;
        });

        assert!(test_count > 1);
    }

    #[test]
    fn test_assert_correct_key_for_plans_indexed_by_product_id() {
        let mut test_count = 0;

        PLANS_BY_STRIPE_PRODUCT_ID.iter().for_each(|(product_id, plan)| {
            assert_eq!(product_id, plan.stripe_product_id().unwrap());
            test_count += 1;
        });

        assert!(test_count > 1);
    }

    #[test]
    fn test_assert_correct_key_for_plans_indexed_by_price_id() {
        let mut test_count = 0;

        PLANS_BY_STRIPE_PRICE_ID.iter().for_each(|(price_id, plan)| {
            assert_eq!(price_id, plan.stripe_price_id().unwrap());
            test_count += 1;
        });

        assert!(test_count > 1);
    }
}
