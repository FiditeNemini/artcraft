use container_common::token::random_prefix_crockford_token::random_prefix_crockford_token;
use errors::AnyhowResult;

/// Central place to define all the token types.
// TODO: Make tokens strongly typed.
#[deprecated(note = "use the 'tokens' crate instead")]
pub struct Tokens;

impl Tokens {

  // ========== Tokens not typically visible to users ==========

  pub fn new_tts_model_upload_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JTUP:", 32, false)
  }

  pub fn new_tts_inference_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JTINF:", 32, false)
  }

  pub fn new_w2l_template_upload_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JWUP:", 32, false)
  }

  pub fn new_w2l_inference_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JWINF:", 32, false)
  }

  pub fn new_firehose_event() -> AnyhowResult<String> {
    random_prefix_crockford_token("EV:", 32, false)
  }

  pub fn new_voice_clone_request_token() -> AnyhowResult<String> {
    random_prefix_crockford_token("VCR:", 32, false)
  }

  pub fn new_category() -> AnyhowResult<String> {
    random_prefix_crockford_token("CAT:", 15, false)
  }
}
