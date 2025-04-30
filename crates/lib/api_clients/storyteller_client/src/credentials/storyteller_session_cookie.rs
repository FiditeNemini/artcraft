
/// The primary FakeYou / Storyteller / Artcraft backend session identifier.
#[derive(Clone)]
pub struct StorytellerSessionCookie {
  cookie: String,
}

impl StorytellerSessionCookie {
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
