use crate::creds::sora_cookies::SoraCookies;
use crate::creds::sora_jwt_bearer_token::SoraJwtBearerToken;
use crate::creds::sora_sentinel::SoraSentinel;

#[derive(Clone)]
pub struct SoraCredentialSet {
  pub (crate) cookies: SoraCookies,
  pub (crate) jwt_bearer_token: Option<SoraJwtBearerToken>,
  pub (crate) sora_sentinel: Option<SoraSentinel>,
}

impl SoraCredentialSet {
  pub fn initialize_with_just_cookies(cookies: SoraCookies) -> Self {
    SoraCredentialSet {
      cookies,
      jwt_bearer_token: None,
      sora_sentinel: None,
    }
  }

  pub fn initialize_with_just_cookies_str(cookies: &str) -> Self {
    Self::initialize_with_just_cookies(
      SoraCookies::new(cookies.to_string()),
    )
  }
}