use crate::claims::google_custom_claims::GoogleCustomClaims;
use errors::{anyhow, AnyhowResult};
use jwt_simple::claims::{Audiences, JWTClaims};

pub struct Claims {
  pub (crate) claims: JWTClaims<GoogleCustomClaims>,
}

impl Claims {
  pub fn email(&self) -> Option<&str> {
    self.claims.custom.email.as_deref()
  }

  pub fn email_verified(&self) -> bool {
    self.claims.custom.email_verified.unwrap_or(false)
  }

  /// Determine if the claim audience is as expected.
  /// This is necessary so third parties don't send claims signed on their behalf by Google.
  pub fn audience_matches(&self, audience: &str) -> AnyhowResult<bool> {
    match self.claims.audiences.as_ref() {
      Some(Audiences::AsString(claim_audience)) => Ok(claim_audience.eq(audience)),
      Some(Audiences::AsSet(audiences)) => Ok(audiences.contains(audience)),
      _ => Err(anyhow!("Invalid audience type")),
    }
  }

  // TODO(bt,2024-09-20): Other fields if important.
}
