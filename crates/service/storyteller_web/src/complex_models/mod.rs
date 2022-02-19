pub mod event_match_predicate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EventMatchPredicate {
  BitsCheermoteNameExactMatch {
    cheermote_name: String,
  },
  BitsSpendThreshold {
    minimum_bits_spent: u32,
  },
  ChannelPointsRewardNameExactMatch {
    reward_name: String,
  },
}

#[cfg(test)]
mod tests {
  use crate::complex_models::EventMatchPredicate;

  #[test]
  fn bits_cheermote_name_exact_match() {
    let rust_value = EventMatchPredicate::BitsCheermoteNameExactMatch {
      cheermote_name: "Cheer1".to_string()
    };
    let json = "{\"bits_cheermote_name_exact_match\":{\"cheermote_name\":\"Cheer1\"}}";

    let converted_to_json= serde_json::to_string(&rust_value).unwrap();
    assert_eq!(&converted_to_json, json);

    let converted_from_json : EventMatchPredicate = serde_json::from_str(json).unwrap();
    assert_eq!(&converted_from_json, &rust_value);
  }
}