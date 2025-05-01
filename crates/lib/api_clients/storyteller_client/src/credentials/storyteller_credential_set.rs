use crate::credentials::storyteller_avt_cookie::StorytellerAvtCookie;
use crate::credentials::storyteller_session_cookie::StorytellerSessionCookie;

#[derive(Clone)]
pub struct StorytellerCredentialSet {
  pub avt: Option<StorytellerAvtCookie>,
  pub session: Option<StorytellerSessionCookie>,
}

impl StorytellerCredentialSet {
  pub fn empty() -> Self {
    Self {
      avt: None,
      session: None,
    }
  }
  
  pub fn initialize(
    avt: Option<StorytellerAvtCookie>,
    session: Option<StorytellerSessionCookie>,
  ) -> Self {
    Self {
      avt,
      session,
    }
  }

  pub fn initialize_with_just_cookie(session: StorytellerSessionCookie) -> Self {
    Self {
      avt: None,
      session: Some(session),
    }
  }

  pub fn initialize_with_just_avt(avt: StorytellerAvtCookie) -> Self {
    Self {
      avt: Some(avt),
      session: None,
    }
  }
  
  pub fn is_empty(&self) -> bool {
    self.avt.is_none() && self.session.is_none()
  }
  
  pub fn equals(&self, other: &Self) -> bool {
    match (&self.avt, &other.avt) {
      (None, None) => {} // Fallthrough
      (Some(avt), Some(other_avt)) => {
        if !avt.equals(other_avt) {
          return false;
        }
      }
      _ => return false,
    }

    match (&self.session, &other.session) {
      (None, None) => {} // Fallthrough
      (Some(session), Some(other_session)) => {
        if !session.equals(other_session) {
          return false;
        }
      }
      _ => return false,
    }

    true
  }
}
