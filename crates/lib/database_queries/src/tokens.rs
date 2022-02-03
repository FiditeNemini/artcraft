use container_common::anyhow_result::AnyhowResult;
use container_common::token::random_prefix_crockford_token::random_prefix_crockford_token;

/// Central place to define all the token types.
// TODO: Make tokens strongly typed.
pub struct Tokens {}

impl Tokens {

  // ========== Tokens with high visibility (make these nice) ==========

  pub fn new_tts_model() -> AnyhowResult<String> {
    random_prefix_crockford_token("TM:", 15, false)
  }

  pub fn new_tts_result() -> AnyhowResult<String> {
    random_prefix_crockford_token("TR:", 32, false)
  }

  pub fn new_w2l_template() -> AnyhowResult<String> {
    random_prefix_crockford_token("WT:", 32, false)
  }

  pub fn new_w2l_result() -> AnyhowResult<String> {
    random_prefix_crockford_token("WR:", 32, false)
  }

  // ========== Tokens not typically visible to users ==========

  pub fn new_user() -> AnyhowResult<String> {
    random_prefix_crockford_token("U:", 15, true)
  }

  pub fn new_session() -> AnyhowResult<String> {
    random_prefix_crockford_token("SESSION:", 32, false)
  }

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

  pub fn new_category() -> AnyhowResult<String> {
    random_prefix_crockford_token("CAT:", 15, false)
  }

  pub fn new_twitch_oauth_grouping_token() -> AnyhowResult<String> {
    random_prefix_crockford_token("OG:", 32, false)
  }
}
