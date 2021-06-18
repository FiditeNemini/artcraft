use crate::util::anyhow_result::AnyhowResult;
use crate::util::random_prefix_crockford_token::random_prefix_crockford_token;

/// Central place to define all the token types.
// TODO: Make tokens strongly typed.
pub struct Tokens {}

TODO TODO TODO

impl Tokens {

  pub fn new_user() -> AnyhowResult<String> {
    random_prefix_crockford_token("U:", 15)
  }

  pub fn new_tts_model() -> AnyhowResult<String> {
    random_prefix_crockford_token("TM:", 15)
  }

  pub fn new_tts_model_upload_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JTUP:", 32)
  }

  pub fn new_tts_result() -> AnyhowResult<String> {
    random_prefix_crockford_token("TR:", 32)
  }

  pub fn new_tts_inference_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JTINF:", 32)
  }

  pub fn new_w2l_template() -> AnyhowResult<String> {
    random_prefix_crockford_token("WT:", 32)
  }

  pub fn new_w2l_template_upload_job() -> AnyhowResult<String> {
    random_prefix_crockford_token("JTUP:", 32)
  }

  pub fn new_w2l_result() -> AnyhowResult<String> {
    random_prefix_crockford_token("WR:", 32)
    TODO TODO TODO
  }
}
