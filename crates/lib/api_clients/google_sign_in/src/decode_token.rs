use errors::AnyhowResult;
use jwt_simple::algorithms::RS256PublicKey;
use jwt_simple::algorithms::RSAPublicKeyLike;
use jwt_simple::claims::JWTClaims;
use jwt_simple::common::VerificationOptions;
use serde_derive::{Deserialize, Serialize};

/// Payload of Google Sign In
/// https://developers.google.com/identity/openid-connect/openid-connect
/// https://stackoverflow.com/questions/31056412/what-all-these-fields-mean
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct GoogleSsoPayload {
  /// The audience that this ID token is intended for. It must be one of the
  /// OAuth 2.0 client IDs of your application.
  /// NB: You must check that this matches the audience (the app client id)
  pub aud: Option<String>,

  /// The Issuer Identifier for the Issuer of the response.
  /// Always `https://accounts.google.com` or `accounts.google.com` for Google ID tokens.
  /// NB: You must check that this matches the issuer.
  pub iss: Option<String>,

  /// The user's email address. Provided only if you included the email scope in your
  /// request. The value of this claim may not be unique to this account and could
  /// change over time, therefore you should not use this value as the primary identifier
  /// to link to your user record. You also can't rely on the domain of the email claim
  /// to identify users of Google Workspace or Cloud organizations; use the hd claim instead.
  pub email: Option<String>,

  /// True if the user's e-mail address has been verified; otherwise false.
  pub email_verified: Option<bool>,

  /// The user's full name, in a displayable form. (See Google documentation)
  pub name: Option<String>,

  /// The client_id of the authorized presenter. This claim is only needed when the party
  /// requesting the ID token is not the same as the audience of the ID token. This may be
  /// the case at Google for hybrid apps where a web application and Android app have a
  /// different OAuth 2.0 client_id but share the same Google APIs project.
  pub azp: Option<String>,

  /// An identifier for the user, unique among all Google accounts and never reused.
  /// A Google account can have multiple email addresses at different points in time,
  /// but the sub value is never changed. Use sub within your application as the
  /// unique-identifier key for the user. Maximum length of 255 case-sensitive ASCII
  /// characters.
  pub sub: Option<String>,
}

/*
  iss https://accounts.google.com
  azp 788843034237-uqcg8tbgofrcf1to37e1bqphd924jaf6.apps.googleusercontent.com
  aud 788843034237-uqcg8tbgofrcf1to37e1bqphd924jaf6.apps.googleusercontent.com
  sub 113101967612396793777
  email vocodes2020@gmail.com
  email_verified true
  nbf 1726786100
  name Vocodes Vocodes
  picture https://lh3.googleusercontent.com/a/ACg8ocLz2-2OaAm0MQxR6j8CNr-Po8_Xr-aryATiCn4c0i_TuDmL_g=s96-c
  given_name Vocodes
  family_name Vocodes
  iat 1726786400
  exp 1726790000
  jti 4d44eeac06ce79fc0ab2270cfeea30d8acf77613
 */

/// Decode a Google Sign In JWT.
/// Verification options can be supplied to increase clock skew tolerance, etc.
pub fn decode_token(key: &RS256PublicKey, token: &str, options: Option<VerificationOptions>) -> AnyhowResult<JWTClaims<GoogleSsoPayload>> {
  let claims = key.verify_token::<GoogleSsoPayload>(token, options)?;
  Ok(claims)
}

#[cfg(test)]
mod tests {
  use crate::decode_token::decode_token;
  use crate::jwk_to_public_key::jwk_to_public_key;
  use coarsetime::Duration;
  use jwt_simple::prelude::VerificationOptions;
  use std::fs::read_to_string;
  use testing::test_file_path::test_file_path;

  #[test]
  fn test_decode() {
    let jwk_file = test_file_path("test_data/crypto/google_signin.jwk").unwrap();
    let jwk_payload = read_to_string(jwk_file).unwrap();
    let key_map = jwk_to_public_key(&jwk_payload).unwrap();

    let credential = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyNjIwZDVlN2YxMzJiNTJhZmU4ODc1Y2RmMzc3NmMwNjQyNDlkMDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3ODg4NDMwMzQyMzctdXFjZzh0YmdvZnJjZjF0bzM3ZTFicXBoZDkyNGphZjYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3ODg4NDMwMzQyMzctdXFjZzh0YmdvZnJjZjF0bzM3ZTFicXBoZDkyNGphZjYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMxMDE5Njc2MTIzOTY3OTM3NzciLCJlbWFpbCI6InZvY29kZXMyMDIwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3MjY3ODYxMDAsIm5hbWUiOiJWb2NvZGVzIFZvY29kZXMiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHoyLTJPYUFtME1ReFI2ajhDTnItUG84X1hyLWFyeUFUaUNuNGMwaV9UdURtTF9nPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlZvY29kZXMiLCJmYW1pbHlfbmFtZSI6IlZvY29kZXMiLCJpYXQiOjE3MjY3ODY0MDAsImV4cCI6MTcyNjc5MDAwMCwianRpIjoiNGQ0NGVlYWMwNmNlNzlmYzBhYjIyNzBjZmVlYTMwZDhhY2Y3NzYxMyJ9.EYg71yIkvhxFGc8ZVCXeTOAmPAtLYDphHnkdf1sh8b_Jz4Y7S1DpmiTqQ1ytxu7J1xNixvdwhuIDzSlCvlxaFl8475GvAlyPTNtZtmWbFD5SRM_XHLOynijOp8WQ4nej-CHvT1KjjqMfkZ1EeQMoWk1H72PxPg_RiUgzsklkUs1wOkLAySk7R3EIAl7bIzpoY_WH2pxv9ccFpBtKDHaDqHkxAWBUQX0-G7ZXZBPVz07V28ZfdbzFDapjZaUFbumazh_-J2-9AA6JkcteF4h_gpbBcLYAuxt5bWI5FECWbYe42khwb93WJ5SK12Tt0EPoyzIObJs14NWGAajtHTg3wA";
    let key = key_map.get("b2620d5e7f132b52afe8875cdf3776c064249d04").unwrap();

    // NB: This key won't work:
    // let key = key_map.get("5aaff47c21d06e266cce395b2145c7c6d4730ea5").unwrap();

    let options = VerificationOptions {
      time_tolerance: Some(Duration::from_days(365 * 30)),
      reject_before: None,
      accept_future: false,
      ..Default::default()
    };

    let claims = decode_token(key, credential, Some(options)).unwrap();

    assert_eq!(claims.jwt_id, Some("4d44eeac06ce79fc0ab2270cfeea30d8acf77613".to_string()));
    assert_eq!(claims.issuer, Some("https://accounts.google.com".to_string()));
    assert_eq!(claims.subject, Some("113101967612396793777".to_string()));
    assert_eq!(claims.issued_at.unwrap().as_secs(), 1726786400);
    assert_eq!(claims.custom.email, Some("vocodes2020@gmail.com".to_string()));
    assert_eq!(claims.custom.azp, Some("788843034237-uqcg8tbgofrcf1to37e1bqphd924jaf6.apps.googleusercontent.com".to_string()));
    //assert_eq!(claims.custom.sub, Some("113101967612396793777".to_string()));
    //assert_eq!(claims.custom.aud, Some("788843034237-uqcg8tbgofrcf1to37e1bqphd924jaf6.apps.googleusercontent.com".to_string()));
  }
}