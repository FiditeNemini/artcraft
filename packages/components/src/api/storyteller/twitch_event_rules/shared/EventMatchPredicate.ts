
export interface NotSet {
};

export interface BitsCheermoteNameExactMatch {
  cheermote_name: string,
};

export interface BitsCheermotePrefixSpendThreshold {
  cheermote_name_prefix: string,
  minimum_bits_spent: number,
};

export interface BitsSpendThreshold {
  minimum_bits_spent: number,
}

export interface ChannelPointsRewardNameExactMatch {
  reward_name: string,
}

// The predicate will have one field set exclusively.
export interface EventMatchPredicate {
  // Empty
  not_set?: NotSet,

  // Bits
  bits_cheermote_name_exact_match?: BitsCheermoteNameExactMatch,
  bits_spend_threshold?: BitsSpendThreshold,
  bits_cheermote_prefix_spend_threshold?: BitsCheermotePrefixSpendThreshold,

  // Channel Points
  channel_points_reward_name_exact_match?: ChannelPointsRewardNameExactMatch,
}