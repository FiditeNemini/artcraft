// TODO: I know this is something we'll need, but I haven't built it yet.
//  We'll probably want to write back to the database.

#[derive(Clone)]
pub struct OauthTokenRefresher {
  user_id: u32,
  auth_token: String,
  refresh_token: Option<String>,
}

impl OauthTokenRefresher {

  pub fn new(user_id: u32, auth_token: &str, refresh_token: Option<&str>) -> Self {
    Self {
      user_id,
      auth_token: auth_token.to_string(),
      refresh_token: refresh_token.map(|str| str.to_string()),
    }
  }

  pub fn get_auth_token(&self) -> String {
    self.auth_token.clone()
  }
}
