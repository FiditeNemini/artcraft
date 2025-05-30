use crate::sora_error::SoraError;
use reqwest::StatusCode;

/*

Old cookie - 

Message: {
  "error": {
    "message": "Your authentication token has expired. Please try signing in again.",
    "type": "invalid_request_error",
    "param": null,
    "code": "token_expired"
  }
}

No cookie - 

Message: {
  "error": {
    "message": "Your authentication token has expired. Please try signing in again.",
    "type": "invalid_request_error",
    "param": null,
    "code": "token_expired"
  }
}

*/

/// Classify the type of error that occurred.
/// This first assumes the request failed and returned a non-200.
pub async fn classify_general_http_status_code_and_body(status: StatusCode, response_body: &str) -> SoraError {
  let message = response_body.to_string();

  // TODO: I *think* this is just the bearer token, not the cookie.
  let cookie_expired =
      message.contains("Your authentication token has expired. Please try signing in again.")
          || message.contains("token_expired");

  if cookie_expired {
    return SoraError::UnauthorizedCookieOrBearerExpired;
  }
  
  let needs_onboarding = 
      message.contains("You must onboard before using this service") 
          || message.contains("onboarding_required");

  if needs_onboarding {
    return SoraError::SoraUsernameNotYetCreated;
  }

  let status_code = status.as_u16();
  
  match status_code {
    403 => {
      if message.contains("challenge-platform") 
          || message.contains("challenge-error-text") 
          || message.contains("cType: 'managed'") {
        return SoraError::CloudFlareChallenge(message);
      }
    }
    502 => {
      return SoraError::BadGateway(message);
    }
    504 => {
      if message.contains("cloudflare") 
          || message.contains("Cloudflare") {
        return SoraError::CloudFlareTimeout(message);
      }
    }
    524 => {
      // NB: 524 is a cloudflare specific gateway timeout error with slightly different semantics than 504.
      if message.contains("cloudflare") 
          || message.contains("Cloudflare") {
        return SoraError::CloudFlareTimeout(message);
      }
    }
    _ => {}, // Fall-through
  }

  SoraError::OtherBadStatus(anyhow::anyhow!("Upload failed with status {}: {}", status, message))
}
