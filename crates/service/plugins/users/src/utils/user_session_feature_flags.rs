use std::collections::BTreeSet;

use enums::by_table::users::user_feature_flag::UserFeatureFlag;

#[derive(Default, Clone)]
pub struct UserSessionFeatureFlags {
  // Optional comma-separated list of parseable `UserFeatureFlag` enum features
  pub maybe_feature_flags: Option<String>,
}

impl UserSessionFeatureFlags {

  pub fn new(maybe_feature_flags: Option<&str>) -> Self {
    Self {
      maybe_feature_flags: maybe_feature_flags.map(|s| s.to_string()),
    }
  }

  // NB: The BTreeSet maintains order so frontend React code doesn't introduce re-render
  // bugs when order changes and makes React think there has been a state change.
  pub fn get_flags(&self) -> BTreeSet<UserFeatureFlag> {
    match self.maybe_feature_flags.as_deref() {
      None => BTreeSet::new(),
      Some(feature_flags) => {
        feature_flags
            .split(",")
            .map(|flag| flag.trim())
            .filter_map(|flag| UserFeatureFlag::from_str(flag).ok())
            .collect()
      }
    }
  }

  // TODO(bt,2024-03-05): Caching
  pub fn has_permission_unoptimized(&self, permission: UserFeatureFlag) -> bool {
    self.get_flags().contains(&permission)
  }
}

#[cfg(test)]
mod tests {
  use enums::by_table::users::user_feature_flag::UserFeatureFlag;

  use crate::utils::user_session_feature_flags::UserSessionFeatureFlags;

  #[test]
  fn test_no_flags() {
    let flags = UserSessionFeatureFlags::default();
    assert_eq!(flags.get_flags().len(), 0);

    for flag in UserFeatureFlag::all_variants() {
      assert_eq!(flags.has_permission_unoptimized(flag), false);
    }

    // TODO(bt,2024-03-05): Expose strum to callers in test packages.
    //for flag in UserFeatureFlag::iter() {
    //  assert_eq!(flags.has_permission_unoptimized(flag), false);
    //}
  }

  #[test]
  fn test_single_feature() {
    let flags = UserSessionFeatureFlags {
      maybe_feature_flags: Some("studio".to_string()),
    };

    assert_eq!(flags.get_flags().len(), 1);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::Studio), true);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::VideoStyleTransfer), false);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::ExploreMedia), false);
  }

  #[test]
  fn test_all_features() {
    let flags = UserSessionFeatureFlags {
      maybe_feature_flags: Some("studio,video_style_transfer,explore_media".to_string()),
    };

    assert_eq!(flags.get_flags().len(), 3);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::Studio), true);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::VideoStyleTransfer), true);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::ExploreMedia), true);
  }

  #[test]
  fn test_duplication() {
    let flags = UserSessionFeatureFlags {
      maybe_feature_flags: Some("studio,studio,studio,studio".to_string()),
    };

    assert_eq!(flags.get_flags().len(), 1);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::Studio), true);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::VideoStyleTransfer), false);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::ExploreMedia), false);
  }

  #[test]
  fn test_spacing() {
    let flags = UserSessionFeatureFlags {
      maybe_feature_flags: Some("  studio,  video_style_transfer , , , ".to_string()),
    };

    assert_eq!(flags.get_flags().len(), 2);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::Studio), true);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::VideoStyleTransfer), true);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::ExploreMedia), false);
  }

  #[test]
  fn test_invalid_features_and_typos() {
    let flags = UserSessionFeatureFlags {
      maybe_feature_flags: Some("invalid,,typo,stdo,STUDIO".to_string()),
    };

    assert_eq!(flags.get_flags().len(), 0);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::Studio), false);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::VideoStyleTransfer), false);
    assert_eq!(flags.has_permission_unoptimized(UserFeatureFlag::ExploreMedia), false);
  }
}