// Rule types for the different types of event types

// For bits / cheermotes
export enum BitsRuleType {
  BitsCheermoteNameExactMatch = "bits_cheermote_name_exact_match",
  BitsCheermotePrefixSpendThreshold = "bits_cheermote_prefix_spend_threshold",
  BitsSpendThreshold = "bits_spend_threshold",
}

// For channel points
export enum ChannelPointsRuleType {
  ChannelPointsRewardNameExactMatch,
}
