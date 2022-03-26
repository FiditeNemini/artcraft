use database_queries::complex_models::event_match_predicate::EventMatchPredicate;

// TODO: Check that the tokens are valid models.

/// Try to prevent saving garbage to the database.
pub fn validate_event_match_predicate(event_match_predicate: &EventMatchPredicate) -> Result<(), String> {
  match event_match_predicate {
    EventMatchPredicate::NotSet {} => {
      // Implicitly valid
    },
    EventMatchPredicate::BitsCheermoteNameExactMatch { cheermote_name } => {
      if cheermote_name.trim().is_empty() {
        return Err("cheermote_name is empty".to_string());
      }
    }
    EventMatchPredicate::BitsCheermotePrefixSpendThreshold { cheermote_prefix, minimum_bits_spent } => {
      if cheermote_prefix.trim().is_empty() {
        return Err("cheermote_prefix is empty".to_string());
      }
      if *minimum_bits_spent < 1 {
        return Err("minimum_bits_spent should be a positive integer".to_string());
      }
    }
    EventMatchPredicate::BitsSpendThreshold { minimum_bits_spent } => {
      if *minimum_bits_spent < 1 {
        return Err("minimum_bits_spent should be a positive integer".to_string());
      }
    }
    EventMatchPredicate::ChannelPointsRewardNameExactMatch { reward_name } => {
      if reward_name.trim().is_empty() {
        return Err("reward_name is empty".to_string());
      }
    }
  }

  Ok(())
}
