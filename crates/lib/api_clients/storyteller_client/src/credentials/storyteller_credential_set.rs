use crate::credentials::storyteller_avt_cookie::StorytellerAvtCookie;
use crate::credentials::storyteller_session_cookie::StorytellerSessionCookie;

#[derive(Clone)]
pub struct StorytellerCredentialSet {
  pub cookie: Option<StorytellerSessionCookie>,
  pub avt: Option<StorytellerAvtCookie>,
}

impl StorytellerCredentialSet {
  pub fn initialize(
    cookie: Option<StorytellerSessionCookie>,
    avt: Option<StorytellerAvtCookie>,
  ) -> Self {
    Self { cookie, avt }
  }

  pub fn initialize_with_just_cookie(cookie: StorytellerSessionCookie) -> Self {
    Self {
      cookie: Some(cookie),
      avt: None,
    }
  }

  pub fn initialize_with_just_avt(avt: StorytellerAvtCookie) -> Self {
    Self {
      cookie: None,
      avt: Some(avt),
    }
  }
}
