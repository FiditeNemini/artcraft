use users_component::utils::user_session_extended::UserSessionExtended;
use crate::server_state::StaticFeatureFlags;

/// Check whether we should allow the request access to Storyteller Studio features.
pub fn allowed_studio_access(maybe_session: Option<&UserSessionExtended>, flags: &StaticFeatureFlags) -> bool {
  if !flags.force_session_studio_flags {
    return true;
  }

  maybe_session
      .map(|ref session| session.role.can_access_studio)
      .unwrap_or(false)
}
