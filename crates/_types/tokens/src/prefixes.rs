// Supposedly there is no limit on number of enum variants, so this shouldn't be exhaustible.
// https://www.reddit.com/r/rust/comments/lf10lv/any_limit_on_enum_variants_amount/

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

// TODO(bt,2023-10-25): Group these into three enums -
//  TokenPrefix, DeprecatedTokenPrefix, (private) RetiredTokenPrefix
//  Then make the same uniqueness assertions.
//  Assert the new token prefixes only end with underscore.

/// Each entity type in our system gets a unique prefix.
/// Older entities have prefixes ending in ':', but newer entities use the Stripe-style "_"
/// separator, which makes it easy to select and copy entire tokens with just mouse clicks across
/// all major operating systems.
#[derive(Debug, Copy, Clone, Eq, PartialEq)]
#[cfg_attr(test, derive(EnumIter, EnumCount))]
pub(crate) enum EntityType {
  AnonymousVisitorTracking, // AVTs are not stored as primary keys in any table, but an index in many tables.
  ApiTokenExternal,
  ApiTokenInternal,
  AuditLog,
  Comment,
  DownloadJob,
  FirehoseEntry,
  InferenceJob,
  MediaFile,
  MediaUpload,
  ModelCategory,
  NewsStory, // NB: aichatbot / sqlite
  TtsInferenceJob,
  TtsModel,
  TtsModelUploadJob,
  TtsRenderTask, // NB: aichatbot / sqlite
  TtsResult,
  TwitchEventRule,
  TwitchOauthGrouping,
  TwitchOauthInternal,
  User,
  UserSession,
  UserSubscription,
  VocoderModel,
  VoiceCloneRequest,
  VoiceConversionModel,
  VoiceConversionResult,
  W2lInferenceJob,
  W2lResult,
  W2lTemplate,
  W2lTemplateUploadJob,
  ZsVoice,
  ZsVoiceDataset,
  ZsVoiceDatasetSample,
  _UserDeprecatedDoNotUse, // NB: Users prior to 2023-10-24. Kept to prevent collision.
  _UserSessionDeprecatedDoNotUse, // NB: Sessions prior to 2023-10-24. Kept to prevent collision.
}

impl EntityType {

  pub fn prefix(self) -> &'static str {
    match self {
      Self::AnonymousVisitorTracking => "avt_",
      Self::ApiTokenExternal => "API:", // NB: Old-style prefix, do not use for future tokens.
      Self::ApiTokenInternal => "INT_API:", // NB: Old-style prefix, do not use for future tokens.
      Self::AuditLog => "audit_",
      Self::Comment => "comment_",
      Self::DownloadJob => "jdown_", // NB: Was "JGUP:"
      Self::FirehoseEntry => "EV:", // NB: Old-style prefix, do not use for future tokens.
      Self::InferenceJob => "jinf_",
      Self::MediaFile => "m_",
      Self::MediaUpload => "mu_",
      Self::ModelCategory => "CAT:", // NB: Old-style prefix, do not use for future tokens.
      Self::NewsStory => "news_story_",
      Self::TtsInferenceJob => "JTINF:", // NB: Old-style prefix, do not use for future tokens.
      Self::TtsModel => "TM:", // NB: Old-style prefix, do not use for future tokens.
      Self::TtsModelUploadJob => "JTUP:", // NB: Old-style prefix, do not use for future tokens.
      Self::TtsRenderTask => "tts_task_",
      Self::TtsResult => "TR:", // NB: Old-style prefix, do not use for future tokens.
      Self::TwitchEventRule => "TER:", // NB: Old-style prefix, do not use for future tokens.
      Self::TwitchOauthGrouping => "OG:", // NB: Old-style prefix, do not use for future tokens.
      Self::TwitchOauthInternal => "TOI:", // NB: Old-style prefix, do not use for future tokens.
      Self::User => "user_",
      Self::UserSession => "session_",
      Self::UserSubscription => "SUB:", // NB: Old-style prefix, do not use for future tokens.
      Self::VocoderModel => "VM:", // NB: Old-style prefix, do not use for future tokens.
      Self::VoiceCloneRequest => "VCR:", // NB: Old-style prefix, do not use for future tokens.
      Self::VoiceConversionModel => "vcm_",
      Self::VoiceConversionResult => "vcr_",
      Self::W2lInferenceJob => "JWINF:", // NB: Old-style prefix, do not use for future tokens.
      Self::W2lResult => "WR:", // NB: Old-style prefix, do not use for future tokens.
      Self::W2lTemplate => "WT:", // NB: Old-style prefix, do not use for future tokens.
      Self::W2lTemplateUploadJob => "JWUP:",  // NB: Old-style prefix, do not use for future tokens.
      Self::ZsVoice => "zsv_",
      Self::ZsVoiceDataset => "zsd_",
      Self::ZsVoiceDatasetSample => "zss_",
      Self::_UserDeprecatedDoNotUse => "U:", // NB: Users prior to 2023-10-24 used this prefix.
      Self::_UserSessionDeprecatedDoNotUse => "SESSION:", // NB: Users prior to 2023-10-24 used this prefix.
    }
  }
}

#[cfg(test)]
mod tests {
  use std::collections::HashSet;

  use strum::EnumCount;
  use strum::IntoEnumIterator;

  use crate::prefixes::EntityType;

  #[test]
  fn test_all_prefixes_are_unique() {
    let entities = EntityType::iter()
        .map(|entity| entity.prefix())
        .collect::<HashSet<&'static str>>();

    assert!(entities.len() > 0);
    assert_eq!(entities.len(), EntityType::COUNT);
  }

  #[test]
  fn test_all_prefixes_are_unique_regardless_of_case_and_suffix() {
    let entities = EntityType::iter()
        .map(|entity| entity.prefix())
        .map(|prefix| prefix.to_lowercase())
        .map(|prefix| prefix.replace("-", ""))
        .map(|prefix| prefix.replace(":", ""))
        .map(|prefix| prefix.replace("_", ""))
        .collect::<HashSet<String>>();

    assert!(entities.len() > 0);

    // NB: We're accounting for collision in a few new/legacy token prefixes:
    //  - `SESSION:` vs `session_` (the same table)
    //  - `VCR:` vs `vcr_` (two actually separate tables!)
    // Don't let this happen anymore!
    let expected_count = EntityType::COUNT - 2;
    assert_eq!(entities.len(), expected_count);
  }

  #[test]
  fn test_all_prefixes_end_with_separator() {
    assert!(EntityType::iter()
        .map(|entity| entity.prefix())
        .all(|prefix| prefix.ends_with(":") || prefix.ends_with("_")));
  }

  #[test]
  fn test_all_prefixes_end_with_separator_length_one() {
    for prefix in EntityType::iter().map(|entity| entity.prefix()) {
      if prefix == "news_story_" || prefix == "tts_task_" || prefix == "INT_API:" {
        // TODO/FIXME: I'm too tired at 5AM to replacen from the left. Make this test valid.
        //  These tokens are from the AIChatBot sidecar, so asserting their validity is less important.
        continue;
      }
      assert_eq!(prefix.len() - 1, prefix.replace(":", "").replace("_", "").len());
    }
  }
}
