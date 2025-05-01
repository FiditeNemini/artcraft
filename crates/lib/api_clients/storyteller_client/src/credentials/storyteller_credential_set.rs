use crate::credentials::storyteller_avt_cookie::StorytellerAvtCookie;
use crate::credentials::storyteller_session_cookie::StorytellerSessionCookie;

#[derive(Clone)]
pub struct StorytellerCredentialSet {
  pub session: Option<StorytellerSessionCookie>,
  pub avt: Option<StorytellerAvtCookie>,
}

impl StorytellerCredentialSet {
  pub fn empty() -> Self {
    Self {
      session: None,
      avt: None,
    }
  }
  
  pub fn initialize(
    session: Option<StorytellerSessionCookie>,
    avt: Option<StorytellerAvtCookie>,
  ) -> Self {
    Self {
      session, 
      avt,
    }
  }

  pub fn initialize_with_just_cookie(session: StorytellerSessionCookie) -> Self {
    Self {
      session: Some(session),
      avt: None,
    }
  }

  pub fn initialize_with_just_avt(avt: StorytellerAvtCookie) -> Self {
    Self {
      session: None,
      avt: Some(avt),
    }
  }
}
