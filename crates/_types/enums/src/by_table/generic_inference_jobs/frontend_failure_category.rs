use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;

/// Used in the `generic_inference_jobs` table in `VARCHAR(32)` field `frontend_failure_category`.
///
/// When jobs fail (permanently or transiently), we need to inform the frontend of the reason,
/// because perhaps there's something the user can do to change their input.
///
/// The previous "VARCHAR(32) failure_reason" column was a text-based message that could not be
/// localized or made user friendly. This `frontend_failure_category` exists to provide well-defined
/// failure categories to the frontend that can easily be localized and indicated consistently in
/// the UI.
///
/// Another benefit is that we'll surface all of the various types of failure and perhaps eventually
/// come to handle some in a cross-cutting way.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize)]
pub enum FrontendFailureCategory {
  /// When a face is not detected in the image used for animation.
  /// For SadTalker (and possibly Wav2Lip)
  #[serde(rename = "face_not_detected")]
  FaceNotDetected,

  #[serde(rename = "retryable_worker_error")]
  RetryableWorkerError,
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(FrontendFailureCategory);
impl_mysql_enum_coders!(FrontendFailureCategory);

/// NB: Legacy API for older code.
impl FrontendFailureCategory {
  pub fn to_str(&self) -> &'static str {
    match self {
      Self::FaceNotDetected => "face_not_detected",
      Self::RetryableWorkerError => "retryable_worker_error",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "face_not_detected" => Ok(Self::FaceNotDetected),
      "retryable_worker_error" => Ok(Self::RetryableWorkerError),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::FaceNotDetected,
      Self::RetryableWorkerError,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::by_table::generic_inference_jobs::frontend_failure_category::FrontendFailureCategory;
  use crate::test_helpers::assert_serialization;

  mod explicit_checks {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(FrontendFailureCategory::FaceNotDetected, "face_not_detected");
      assert_serialization(FrontendFailureCategory::RetryableWorkerError, "retryable_worker_error");
    }

    #[test]
    fn to_str() {
      assert_eq!(FrontendFailureCategory::FaceNotDetected.to_str(), "face_not_detected");
      assert_eq!(FrontendFailureCategory::RetryableWorkerError.to_str(), "retryable_worker_error");
    }

    #[test]
    fn from_str() {
      assert_eq!(FrontendFailureCategory::from_str("face_not_detected").unwrap(), FrontendFailureCategory::FaceNotDetected);
      assert_eq!(FrontendFailureCategory::from_str("retryable_worker_error").unwrap(), FrontendFailureCategory::RetryableWorkerError);
    }

    #[test]
    fn all_variants() {
      let mut variants = FrontendFailureCategory::all_variants();
      assert_eq!(variants.len(), 2);
      assert_eq!(variants.pop_first(), Some(FrontendFailureCategory::FaceNotDetected));
      assert_eq!(variants.pop_first(), Some(FrontendFailureCategory::RetryableWorkerError));
      assert_eq!(variants.pop_first(), None);
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn variant_length() {
      use strum::IntoEnumIterator;
      assert_eq!(FrontendFailureCategory::all_variants().len(), FrontendFailureCategory::iter().len());
    }

    #[test]
    fn round_trip() {
      for variant in FrontendFailureCategory::all_variants() {
        assert_eq!(variant, FrontendFailureCategory::from_str(variant.to_str()).unwrap());
        assert_eq!(variant, FrontendFailureCategory::from_str(&format!("{}", variant)).unwrap());
        assert_eq!(variant, FrontendFailureCategory::from_str(&format!("{:?}", variant)).unwrap());
      }
    }
  }
}
