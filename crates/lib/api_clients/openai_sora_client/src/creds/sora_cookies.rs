/// Cookies are the credential that are always required.
/// You can mint a JWT bearer token with just the cookies.
pub struct SoraCookies {
  cookies: String,
}

impl SoraCookies {
  pub fn new(cookies: String) -> Self {
    SoraCookies { cookies }
  }

  pub fn get_cookies(&self) -> &str {
    &self.cookies
  }
}
