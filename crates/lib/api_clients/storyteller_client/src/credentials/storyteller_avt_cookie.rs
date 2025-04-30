
/// The "anonymous visitor token" cookie allows users to interact with
/// the service in a logged-out state with some continuity.
#[derive(Clone)]
pub struct StorytellerAvtCookie {
  cookie: String,
}

impl StorytellerAvtCookie {
  pub fn new(cookie: String) -> Self {
    Self { cookie }
  }

  pub fn as_str(&self) -> &str {
    &self.cookie
  }

  pub fn as_bytes(&self) -> &[u8] {
    self.cookie.as_bytes()
  }

  pub fn to_string(&self) -> String {
    self.cookie.clone()
  }
}
