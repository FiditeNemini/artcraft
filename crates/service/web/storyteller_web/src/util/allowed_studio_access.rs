use mysql_queries::queries::users::user_sessions::get_user_session_by_token::SessionUserRecord;
use users_component::utils::user_session_extended::UserSessionExtended;

use crate::server_state::StaticFeatureFlags;

/// Check whether we should allow the request access to Storyteller Studio features.
pub fn allowed_studio_access(maybe_session: Option<impl UserSessionStudioFlag>, flags: &StaticFeatureFlags) -> bool {
  if !flags.force_session_studio_flags {
    return true;
  }

  maybe_session
      .map(|ref session| session.can_access_studio())
      .unwrap_or(false)
}

pub trait UserSessionStudioFlag {
  fn can_access_studio(&self) -> bool;
}

impl UserSessionStudioFlag for UserSessionExtended {
  fn can_access_studio(&self) -> bool {
    self.role.can_access_studio
  }
}

impl UserSessionStudioFlag for &UserSessionExtended {
  fn can_access_studio(&self) -> bool {
    self.role.can_access_studio
  }
}

impl UserSessionStudioFlag for SessionUserRecord {
  fn can_access_studio(&self) -> bool {
    self.can_access_studio
  }
}

impl UserSessionStudioFlag for &SessionUserRecord {
  fn can_access_studio(&self) -> bool {
    self.can_access_studio
  }
}
