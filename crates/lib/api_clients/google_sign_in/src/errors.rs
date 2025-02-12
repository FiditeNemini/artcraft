use errors::AnyhowError;
use std::error::Error;
use std::fmt::Display;

#[derive(Debug)]
pub enum VerifyError {
  /// Could not decode a JWT token.
  JwtDecodeError { source: AnyhowError },

  /// The JWT has expired (was issued before the current
  /// clock + deadline + skew tolerance)
  JwtExpired,

  /// The key requested by the JWT was not available.
  /// This likely means we need to refresh our JWK key set.
  JwtKeyMissing { requested_key: String },

  /// The audience for the JWT claims was absent or unexpected.
  JwtInvalidAudience,

  /// The issuer of the JWT claims was absent or unexpected.
  JwtInvalidIssuer,

  /// Any other error type we haven't wrapped.
  AnyhowError(AnyhowError),
}

impl Error for VerifyError {}

impl Display for VerifyError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::JwtDecodeError { source } => {
        write!(f, "JWT decode error: {}", source)
      }
      Self::JwtExpired => {
        write!(f, "JWT token has expired")
      }
      Self::JwtKeyMissing { requested_key } => {
        write!(f, "JWT requested key absent from JWK: {}", requested_key)
      }
      Self::JwtInvalidAudience => {
        write!(f, "Unexpected or missing JWT audience")
      }
      Self::JwtInvalidIssuer => {
        write!(f, "Unexpected or missing JWT issuer")
      }
      Self::AnyhowError(err) => {
        write!(f, "AnyhowError: {}", err)
      }
    }
  }
}

impl From<AnyhowError> for VerifyError {
  fn from(value: AnyhowError) -> Self {
    Self::AnyhowError(value)
  }
}
